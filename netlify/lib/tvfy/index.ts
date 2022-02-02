import fetch from 'node-fetch';

/**
 * https://theyvoteforyou.org.au/help/data#policy
 */
 interface TvfyPolicy {
  id: number;
  name: string;
  description: string;
  provisional: boolean;
  policy_divisions: TvfyPolicyDivision[]
  people_comparisons: TvfyPersonComparison[]
}

interface TvfyPolicyDivision {
  // incomplete
  division: {};
  vote: string;
  strong: boolean;
}

interface TvfyPersonComparison {
  person: {
    id: number;
    latest_member: {
      id: number;
      name: {
        first: string;
        last: string;
      };
      electorate: string;
      house: string;
      party: string;
    }
  };
  agreement: string;
  voted: boolean;
}

export class Tvfy {
  private _apiKey: string;

  constructor() {
    this._apiKey = process.env.TVFY_API_KEY;
  }

  public async policy(id: number): Promise<TvfyPolicy> {
    return await fetch(`https://theyvoteforyou.org.au/api/v1/policies/${id}.json?key=${this._apiKey}`)
      .then(response => response.json()) as TvfyPolicy;
  }
}
