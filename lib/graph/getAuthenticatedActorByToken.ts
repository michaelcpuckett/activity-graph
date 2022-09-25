import { Graph } from ".";
import * as firebaseAdmin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';
import serviceAccount from '../../credentials';

export async function getAuthenticatedUserIdByToken(this: Graph, token: string): Promise<string | null> {
  if (!firebaseAdmin.apps.length) {
    const appOptions: AppOptions = {
      credential: firebaseAdmin.credential.cert(serviceAccount),
      projectId: 'socialweb-id',
    };

    firebaseAdmin.initializeApp(appOptions);
  }

  const user = !token
    ? null
    : await firebaseAdmin
      .auth()
      .verifyIdToken(token)
      .then(async (userCredential) => {
        return userCredential ?? null;
      })
      .catch((error) => {
        console.error(error);
        return null;
      });

  if (!user?.uid) {
    return null;
  }

  return user.uid;
}