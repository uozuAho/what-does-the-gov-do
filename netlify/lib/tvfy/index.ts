import { policy } from './policy';

export class Tvfy {
  private _apiKey: string;

  constructor() {
    this._apiKey = process.env.TVFY_API_KEY;
  }

  public async policy(id: number) { return policy(this._apiKey, id); }
}
