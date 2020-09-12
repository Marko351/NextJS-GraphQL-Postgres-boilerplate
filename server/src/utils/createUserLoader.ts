import DataLoader from 'dataloader';
import { User } from '../entities/User';

// [1, 2, 3, 45] => userIDS
// [{id: 1, username: 'Marko'}, {}, {}, {}] => returns user
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
    return sortedUsers;
  });
