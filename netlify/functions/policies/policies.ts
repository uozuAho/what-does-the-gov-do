import { Handler } from '@netlify/functions';
import { Tvfy } from '../../lib/tvfy';

export const handler: Handler = async (event, context) => {
  const policies = await new Tvfy().policies();

  return {
    statusCode: 200,
    body: JSON.stringify(policies),
    headers: {
      'Cache-Control': "max-age=300, public"
    }
  }
}
