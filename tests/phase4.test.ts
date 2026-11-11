import assert from 'node:assert/strict';
import { test } from 'node:test';
import { demoScenarios } from '../src/simulations/scenarios.ts';
import { getParameters, catalog, isDynamic } from '../src/simulations/catalog.ts';
import type { LabRoute } from '../src/simulations/catalog.ts';
import {
  tourFor,
  challengeTour,
  hasSeenTour,
  markTourSeen,
  tourStorageKey,
} from '../src/tours/config.ts';
import { nonlinearPeriod, pendulumLimits } from '../src/simulations/pendulum/physics.ts';
import { collisionPlan, collisionTotals } from '../src/simulations/collision/physics.ts';
import { energyState } from '../src/simulations/energy/physics.ts';
import { createOscillator } from '../src/simulations/oscillator/physics.ts';

test('demo parameters respect slider bounds and model contracts', () => {
  assert.equal(new Set(demoScenarios.map((s) => s.id)).size, demoScenarios.length);
  for (const s of demoScenarios) {
    if (s.model === 'pendulum') {
      for (const [key, bounds] of Object.entries(pendulumLimits)) {
        const value = s.params[key as keyof typeof s.params];
        assert.ok(value >= bounds.min && value <= bounds.max, `${s.id}:${key}`);
      }
      assert.ok(Number.isFinite(nonlinearPeriod(s.params)));
    } else {
      assert.equal(s.config.kind, s.model);
      for (const parameter of getParameters(s.config))
        assert.ok(
          parameter.value >= parameter.min && parameter.value <= parameter.max,
          `${s.id}:${parameter.key}`,
        );
      if (s.config.kind === 'oscillator')
        assert.ok(Number.isFinite(createOscillator(s.config.params).state(30).x));
      if (s.config.kind === 'energy')
        assert.ok(Number.isFinite(energyState(s.config.params, 0).end));
    }
  }
});
test('paired collision demos change only the collision kind and conserve momentum', () => {
  const pair = demoScenarios.filter((s) => s.model === 'collision');
  const params = pair.map((s) =>
    s.model !== 'pendulum' && s.config.kind === 'collision' ? s.config.params : null,
  );
  assert.deepEqual({ ...params[0], kind: 'inelastic' }, params[1]);
  for (const p of params) {
    assert.ok(p);
    const contact = collisionPlan(p).contact;
    assert.ok(contact);
    const before = collisionTotals(p, p.v1, p.v2);
    const after = collisionTotals(p, contact.v1, contact.v2);
    assert.ok(Math.abs(after.momentum - before.momentum) < 1e-10);
    if (p.kind === 'elastic') assert.ok(Math.abs(after.kinetic - before.kinetic) < 1e-10);
    else assert.ok(after.kinetic < before.kinetic);
  }
});
test('all existing labs have appropriately sized tours without time controls on static labs', () => {
  for (const model of Object.keys(catalog) as LabRoute[]) {
    const tour = tourFor(model);
    assert.equal(tour.id, model);
    assert.equal(tour.steps.length, model === 'pendulum' ? 7 : isDynamic(model) ? 4 : 3);
    if (!isDynamic(model)) assert.ok(tour.steps.every((s) => s.target !== '.playback-controls'));
  }
  assert.equal(challengeTour.steps.length, 5);
});
test('tour storage is versioned and degrades safely when browser storage throws', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Storage blocked');
    },
  });
  try {
    const tour = { ...challengeTour, id: 'storage-test' };
    assert.equal(hasSeenTour(tour), false);
    markTourSeen(tour);
    assert.equal(hasSeenTour(tour), true);
    assert.equal(hasSeenTour({ ...tour, version: 2 }), false);
    assert.notEqual(tourStorageKey(tour), tourStorageKey({ ...tour, version: 2 }));
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
