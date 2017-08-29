import Component, { tracked } from '@glimmer/component';
import { playNote } from './../../../utils/audio';

export default class SynthKey extends Component {
  constructor(opts) {
    super(opts);
    this.code = opts.args.code;
    this.isEbony = opts.args.ebony ? ' is-ebony' : '';
    this.frequency = opts.args.frequency;
  }

  /**
    Bound class to signal if key should be ebony(flat/sharp) key

    @property isEbony
  */
  public isEbony:string = '';

  /**
    Keyboard code assigned to this instance

    @method code
  */
  public code:number = null;

  /**
    Frequency assigned to this instance

    @method code
  */
  public frequency:number = null;

  /**
    Contextual event listener

    @method _eventHandler
  */
  private _eventClosure:EventListener = () => false;

  /**
    Bound class to highlight key when pressed

    @property pressed
  */
  @tracked
  isPressed:string = '';

  isTyping:boolean = false;

  /**
    Handle event

    @method _eventHandler
  */
  private async _eventHandler(e) {
    // TODO generator?
    while (this.isTyping) {
      return;
    }
    if (e.keyCode === this.code) {
      this.isTyping = true;
      playNote(this.frequency);
      this.isPressed = ' is-pressed';
      await setTimeout(() => {
        this.isPressed = '';
        this.isTyping = false;
      }, 150);
    }
  }

  /**
    Attach event handlers

    @method _attachExitHandlers
  */
  private _attachEventHandler() {
    // create a keyboard event instance
    const keyboard = new KeyboardEvent('keypress', { view: window, bubbles: true, cancelable: true });
    keyboard.initEvent('keypress', true, true);

    // create/cache a closure giving _eventHandler context
    let _eventClosure = ((e) => this._eventHandler(e)); // REVIEW Can all handling this be a singleton?
    this._eventClosure = _eventClosure;

    // add listeners and dispatch the events
    document.addEventListener('keypress', _eventClosure, false);
    document.dispatchEvent(keyboard);
  }

  /**
    Detach event handlers

    @method _detachEventHandler
  */
  private _detachEventHandler() {
    document.removeEventListener('keypress', this._eventClosure, false);
  }

  public didInsertElement() {
    this._attachEventHandler();
  }

  public willDestroy() {
    this._detachEventHandler();
  }
};
