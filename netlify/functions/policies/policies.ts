import { Handler } from '@netlify/functions';
import { Tvfy } from '../../lib/tvfy';

/** API response = Policy[] */
interface Policy {
  id: number;
  name: string;
  description: string;
  last_edited_at: string;
}

export const handler: Handler = async (event, context) => {
  const all_policies = await new Tvfy().policies();

  let policies = all_policies.filter(p => !p.provisional);
  policies.sort((a, b) => new Date(b.last_edited_at).getTime() - new Date(a.last_edited_at).getTime());
  policies = policies.map(p => ({
    ...p,
    last_edited_at: new Date(p.last_edited_at).toISOString().slice(0, 10)
  }))

  return {
    statusCode: 200,
    body: JSON.stringify(policies),
    headers: {
      'Cache-Control': "max-age=300, public"
    }
  }
}
