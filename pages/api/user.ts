import serviceAccount from '../../credentials';
import userHandler from 'activitypub-core/src/endpoints/user';
export default userHandler(serviceAccount);
