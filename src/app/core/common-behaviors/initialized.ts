import { Observable, Subscriber } from 'rxjs';
import { Constructor } from './constructor';

export interface HasInitialized {
	initialized: Observable<void>;

	_markInitialized: () => void;
}

export type HasInitializedCtor = Constructor<HasInitialized>;

export function mixinInitialized<T extends Constructor<{}>>(base: T):
	HasInitializedCtor & T {
	return class extends base {
		_isInitialized = false;
		_pendingSubscribers: Subscriber<void>[] | null = [];
		initialized = new Observable<void>(subscriber => {
			if (this._isInitialized) {
				this._notifySubscriber(subscriber);
			} else {
				this._pendingSubscribers!.push(subscriber);
			}
		});

		constructor(...args: any[]) { super(...args); }

		_markInitialized(): void {
			if (this._isInitialized) {
				throw Error('This directive has already been marked as initialized and ' +
					'should not be called twice.');
			}

			this._isInitialized = true;

			this._pendingSubscribers!.forEach(this._notifySubscriber);
			this._pendingSubscribers = null;
		}

		_notifySubscriber(subscriber: Subscriber<void>): void {
			subscriber.next();
			subscriber.complete();
		}
	};
}
