import { Handler } from '@netlify/functions';
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

class PolicyAgreementByParty {
  public partyAgreements: Map<string, PartyAgreement> = new Map();

  constructor(
    public title: string,
    public description: string) {}

  public toJson() {
    return JSON.stringify({
      title: this.title,
      description: this.description,
      partyAgreements: Array.from(this.partyAgreements.values())
    });
  }
}

interface PartyAgreement {
  party: string;
  agreements: Number[];
  color: string | null;
}

export const handler: Handler = async (event, context) => {
  const apiKey = process.env.TVFY_API_KEY;
  const { id } = event.queryStringParameters;

  const policy = await fetch(`https://theyvoteforyou.org.au/api/v1/policies/${id}.json?key=${apiKey}`)
    .then(response => response.json()) as TvfyPolicy;

  const asdf = new PolicyAgreementByParty(policy.name, policy.description);

  const partyAgreements = policy.people_comparisons.reduce((parties, pc) => {
    const party = pc.person.latest_member.party;
    if (!parties.partyAgreements.has(party)) {
      parties.partyAgreements.set(party, {
        party,
        agreements: [],
        color: null
      });
    }

    parties.partyAgreements.get(party).agreements.push(new Number(pc.agreement));

    return parties;
  }, asdf);

  return {
    statusCode: 200,
    body: partyAgreements.toJson(),
  }
}
