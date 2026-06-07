import { test, expect } from 'fixtures';
import { TAGS } from 'data/tags';

test.describe('[ADO-100] Sign In feature', () => {
  test('User LogIn - positive', {tag: TAGS.REGRESSION}, async ({ signInService }) => {
    await signInService.signIn();
  });
});

