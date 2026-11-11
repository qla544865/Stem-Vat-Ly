"""Optional browser QA: install Playwright for Python outside app dependencies.
Run a production preview at PHYLAB_QA_URL (default /phylab/ on port 4176).
PHYLAB_PLAYWRIGHT_PATH can point to an existing Python Playwright installation.
PHYLAB_BROWSER can specify a Chromium executable; otherwise use Playwright's default.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
from shutil import copytree
import sys
from tempfile import TemporaryDirectory
from threading import Thread
if os.getenv('PHYLAB_PLAYWRIGHT_PATH'):
    sys.path.insert(0, os.environ['PHYLAB_PLAYWRIGHT_PATH'])
from playwright.sync_api import sync_playwright, expect

URL = os.getenv('PHYLAB_QA_URL', 'http://127.0.0.1:4176/phylab/')
INIT = """
const raf = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window);
const pending = new Set(); window.peakFrames = 0; window.pendingFrames = () => pending.size;
window.requestAnimationFrame = callback => { let id = raf(t => {pending.delete(id); callback(t)}); pending.add(id); window.peakFrames = Math.max(window.peakFrames, pending.size); return id; };
window.cancelAnimationFrame = id => {pending.delete(id); cancel(id)};
"""
with sync_playwright() as pw:
    options = {'executable_path': os.environ['PHYLAB_BROWSER']} if os.getenv('PHYLAB_BROWSER') else {}
    browser = pw.chromium.launch(**options)
    context = browser.new_context(viewport={'width':1366,'height':768}, reduced_motion='reduce')
    context.add_init_script(INIT)
    context.route('https://fonts.**/*', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    page = context.new_page()
    page.set_default_timeout(6000)
    errors, assets = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda msg: errors.append(msg.text) if msg.type in ('warning','error') else None)
    page.on('response', lambda r: assets.append((r.url,r.status)) if '/assets/' in r.url else None)
    def button(name): return page.get_by_role('button', name=name, exact=True)
    def go(route):
        page.goto(URL+'#/'+route)
        expect(page.locator('h1')).to_be_visible()
    def start():
        entry = page.locator('.tour-entry button').first
        entry.click()
        expect(page.get_by_role('dialog')).to_be_visible()
    def next_step(): button('Tiếp theo').click()
    def closed(): expect(page.get_by_role('dialog')).to_have_count(0)
    def frames(n): page.wait_for_function(f'pendingFrames() === {n}')
    def layout(): assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), page.url
    def load_demo(id):
        details=page.locator('.demo-scenarios')
        if details.get_attribute('open') is None: details.locator('summary').click()
        details.locator('select').select_option(id)
        button('Nạp demo').click()
        expect(details.get_by_role('status')).to_contain_text('Đã nạp')
        frames(0)
    go('pendulum')
    expect(button('Bắt đầu hướng dẫn')).to_be_visible()
    closed()
    start()
    expect(button('Quay lại')).to_be_disabled()
    page.keyboard.press('Tab')
    assert page.evaluate("document.activeElement.getAttribute('aria-label')") == 'Đóng hướng dẫn'
    page.keyboard.press('Escape')
    closed()
    expect(button('Hướng dẫn')).to_be_focused()
    page.reload()
    expect(button('Hướng dẫn')).to_be_visible()
    start()
    next_step()
    page.locator('.control-card').evaluate("el => el.style.display='none'")
    expect(page.get_by_role('dialog')).to_contain_text('Vùng này đang ẩn')
    page.set_viewport_size({'width':390,'height':844})
    layout()
    button('Quay lại').click()
    next_step()
    page.locator('.control-card').evaluate("el => el.style.display=''")
    expect(page.get_by_role('dialog').get_by_role('status')).to_have_count(0)
    for _ in range(3): next_step()
    button('Mở Thực hành').click()
    expect(page.get_by_role('dialog')).to_be_visible()
    expect(page.locator('.pendulum-panel')).to_be_visible()
    next_step()
    expect(page.locator('.pendulum-panel')).to_have_class('card pendulum-panel tour-target')
    next_step()
    button('Mở Kết quả & đồ thị').click()
    button('Hoàn thành').click()
    closed()
    start()
    button('Sandbox').click()
    closed()
    start()
    page.evaluate("location.hash='#/collision'")
    closed()
    assert page.locator('.tour-target').count() == 0
    # Invitation skip, completion and persistence on independent tours.
    expect(button('Bắt đầu hướng dẫn')).to_be_visible()
    button('Bỏ qua').click()
    expect(button('Hướng dẫn')).to_be_focused()
    page.reload()
    expect(button('Hướng dẫn')).to_be_visible()
    for route in ['spring/hooke','spring/oscillation','torque','circular','projectile','work','energy','oscillator','forces','power','efficiency','challenges','challenges/secret','challenges/oscillation-phenomena']:
        go(route)
        start()
        while button('Tiếp theo').count(): next_step()
        button('Hoàn thành').click()
        closed()
        layout()
        if route in ['spring/hooke','torque','work','forces','power','efficiency']:
            assert page.locator('.playback-controls').count() == 0
        if route == 'challenges/secret': assert page.locator('#param-k').count() == 0
        if route.startswith('challenges'): assert page.locator('.demo-scenarios').count() == 0
    print('PASS all tours, keyboard, hidden targets, resizing, persistence, route/mode changes', flush=True)
    # Real measurement is preserved across tours, demos and navigation in the session.
    page.set_viewport_size({'width':1366,'height':768})
    go('pendulum')
    button('Thực hành').click()
    page.get_by_label('Dự đoán', exact=False).fill('Dự đoán được giữ')
    button('2×').click()
    button('Đo 10 dao động').click()
    expect(button('Ghi kết quả')).to_be_enabled(timeout=18000)
    button('Ghi kết quả').click()
    before = page.locator('.pendulum-practice-table table').inner_text()
    start()
    page.keyboard.press('Escape')
    assert page.locator('.pendulum-practice-table table').inner_text() == before
    for id in ['pendulum-mass','pendulum-length','pendulum-measure']:
        load_demo(id)
        if id == 'pendulum-mass':
            expect(page.locator('#param-m')).to_have_value('50')
        elif id == 'pendulum-length':
            expect(page.locator('#param-l')).to_have_value('40')
        else:
            expect(page.get_by_label('Bài khảo sát')).to_have_value('length')
        expect(page.locator('.time-label')).to_contain_text('0.00')
    button('Thực hành').click()
    page.get_by_label('Bài khảo sát').select_option('amplitude')
    assert page.locator('.pendulum-practice-table table').inner_text() == before
    expect(page.get_by_label('Dự đoán', exact=False)).to_have_value('Dự đoán được giữ')
    page.locator('.demo-scenarios').get_by_role('button',name='Cấu hình mặc định').click()
    go('energy')
    go('pendulum')
    button('Kết quả & đồ thị').click()
    expect(page.get_by_role('region',name='Kết quả & đồ thị')).to_contain_text('1/10 MỐC ĐÃ GHI')
    print('PASS actual ten-cycle measurement and notebook preservation', flush=True)
    for route, ids in [('collision',['collision-elastic','collision-soft']),('energy',['energy-slope']),('oscillator',['oscillator-free','oscillator-damped','oscillator-resonance'])]:
        go(route)
        for id in ids:
            button('Bắt đầu').click()
            frames(1)
            load_demo(id)
            expect(page.locator('.time-label')).to_contain_text('0.00')
            if route == 'collision':
                expect(page.get_by_label('Loại va chạm')).to_have_value('elastic' if id.endswith('elastic') else 'inelastic')
            elif route == 'energy':
                expect(page.locator('#param-h')).to_have_value('5')
            else:
                expect(page.get_by_label('Chế độ dao động')).to_have_value('resonance' if id.endswith('resonance') else 'damped')
                expect(page.locator('#param-b')).to_have_value('0' if id.endswith('free') else '1')
                if id.endswith('resonance'):
                    expect(page.get_by_role('heading', name='Đáp ứng xác lập X(Ω)')).to_be_visible()
            button('Bắt đầu').click()
            frames(1)
            button('2×').click()
            button('Tạm dừng').click()
            frames(0)
            button('Đặt lại mô phỏng').click()
        button('Cấu hình mặc định').click()
    assert page.evaluate('peakFrames') <= 1
    print('PASS nine scenarios, playback/reset/speed and one RAF', flush=True)
    for w,h in [(1920,1080),(1366,768),(1280,720),(390,844)]:
        page.set_viewport_size({'width':w,'height':h})
        for route in ['pendulum','spring/oscillation','circular','projectile','collision','energy','oscillator']:
            go(route)
            for _ in range(2):
                button('Trình chiếu').click()
                layout()
                expect(button('Thoát trình chiếu')).to_be_visible()
                canvas = page.locator('canvas')
                assert canvas.bounding_box()['width'] > 0
                if w >= 1001:
                    playback = button('Bắt đầu').bounding_box()
                    assert playback['y'] + playback['height'] <= h, (route, w, h, playback)
                button('Bắt đầu').click()
                button('Tạm dừng').click()
                button('Đặt lại mô phỏng').click()
                button('Thoát trình chiếu').click()
            button('Trình chiếu').click()
            page.screenshot(path=f'.qa/phase4-{route.replace("/","-")}-{w}.png',full_page=True)
            page.evaluate("location.hash='#/forces'")
            expect(page.locator('.lab-presenting,.pendulum-presenting')).to_have_count(0)
            frames(0)
        print(f'PASS projector and presentation {w}x{h}',flush=True)
    blocked = browser.new_context()
    blocked.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})")
    blocked.route('https://fonts.**/*', lambda r: r.fulfill(status=200,content_type='text/css',body=''))
    bpage = blocked.new_page()
    bpage.on('pageerror',lambda e: errors.append(str(e)))
    bpage.goto(URL+'#/pendulum')
    bpage.get_by_role('button',name='Bắt đầu hướng dẫn',exact=True).click()
    bpage.keyboard.press('Escape')
    bpage.evaluate("location.hash='#/energy'")
    expect(bpage.locator('.lab-page-heading')).to_be_visible()
    bpage.evaluate("location.hash='#/pendulum'")
    expect(bpage.get_by_role('button',name='Hướng dẫn',exact=True)).to_be_visible()
    blocked.close()
    page.reload()
    layout()
    assert assets and all(status in (200,304) for _,status in assets)
    assert not errors,errors
    print(json.dumps({'browser':browser.version,'errors':errors,'assets':len(assets),'base_url':URL},ensure_ascii=False),flush=True)
    # Serve dist from an ordinary static server with no SPA fallback.
    class QuietStaticHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass
    dist = Path(__file__).resolve().parents[1] / 'dist'
    with TemporaryDirectory() as directory:
        root = Path(directory)
        copytree(dist, root, dirs_exist_ok=True)
        copytree(dist, root / 'phylab')
        with ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietStaticHandler, directory=directory)) as server:
            thread = Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                for base in ['/', '/phylab/']:
                    static = context.new_page()
                    static.on('pageerror', lambda error: errors.append(str(error)))
                    responses = []
                    record = lambda response: responses.append((response.url, response.status))
                    static.on('response', record)
                    origin = f'http://127.0.0.1:{server.server_port}'
                    static.goto(origin + base + '#/challenges/secret')
                    expect(static.locator('.challenge-card')).to_be_visible()
                    static.reload()
                    expect(static.locator('.challenge-card')).to_be_visible()
                    static.evaluate("location.hash='#/pendulum'")
                    expect(static.locator('.pendulum-stage canvas')).to_be_visible()
                    static.reload()
                    expect(static.locator('.pendulum-stage canvas')).to_be_visible()
                    local_assets = [(url, status) for url, status in responses if '/assets/' in url or url.endswith('/favicon.svg')]
                    assert any(url.endswith('.js') for url, _ in local_assets)
                    assert any(url.endswith('.css') for url, _ in local_assets)
                    assert all(url.startswith(origin + base) and status in (200, 304) for url, status in local_assets), local_assets
                    favicon = static.locator('link[rel=icon]').evaluate('link => link.href')
                    assert favicon == origin + base + 'favicon.svg'
                    assert static.request.get(favicon).ok
                    static.close()
                    print(f'PASS static root/deep link/assets at {base}', flush=True)
            finally:
                server.shutdown()
                thread.join()
    assert not errors, errors
    browser.close()
