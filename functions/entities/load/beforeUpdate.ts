/**
 * Load Entity - Before Update Hook
 * Same validation as beforeCreate
 */

import beforeCreate from './beforeCreate';

export default async function beforeUpdate({ data, user, existingData }) {
  // Use same validation logic as create
  // existingData contains current database values if needed
  
  return await beforeCreate({ data, user });
}