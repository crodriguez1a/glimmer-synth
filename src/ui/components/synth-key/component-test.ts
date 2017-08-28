import { setupRenderingTest } from '@glimmer/test-helpers';
import hbs from '@glimmer/inline-precompile';

const { module, test } = QUnit;

module('Component: synth-key', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await this.render(hbs`<synth-key />`);
    assert.ok(this.containerElement.querySelector('div'));
  });

  test('it plays a sound', async function(assert) {
    await this.render(hbs`<synth-key />`);
    assert.ok(false, 'it played an A');
  })
});
