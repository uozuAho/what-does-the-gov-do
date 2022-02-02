import { Handler } from '@netlify/functions';
import { Tvfy } from '../../lib/tvfy';

/**
 * Expected request params:
 * id: policy id
 */

/**
 * The response of this API
 */
interface PolicyDetails {
  title: string;
  description: string;
  partyAgreements: PartyAgreement[]
}

interface PartyAgreement {
  party: string;
  agreements: Number[];
  color: string | null;
}

// todo: make this implement PolicyDetails?
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

export const handler: Handler = async (event, context) => {
  const { id } = event.queryStringParameters;
  const tvfy = new Tvfy();

  const policy = await tvfy.policy(Number(id));

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
