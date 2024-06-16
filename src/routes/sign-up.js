const { Layout } = require('../templates.js');
const { createUser } = require('../model/user.js');
const { createSession } = require('../model/session.js');

function get(req, res) {
  const title = 'Create an account';
  const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      <form method="POST" class="Row">
        <div class="Stack" style="--gap: 0.25rem">
          <label for="email">email</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="Stack" style="--gap: 0.25rem">
          <label for="password">password</label>
          <input type="password" id="password" name="password" required>
        </div>
        <button class="Button">Sign up</button>
      </form>
    </div>
  `;
  const body = Layout({ title, content });
  res.send(body);
}

async function post(req, res) {
  const bcrypt = require('bcryptjs');

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Bad input');
  }

  try {
    /* [1] Hash the password */
    const hashedPassword = await bcrypt.hash(password, 12);

    /* [2] Create the user in the DB */
    const user = await createUser(email, hashedPassword);

    /* [3] Create the session with the new user's ID */
    const sessionID = await createSession(user.id);

    /* [4] Set a cookie with the session ID */
    res.cookie('sid', sessionID, {
      signed: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    });

    /* [5] Redirect to the user's confession page (e.g. /confessions/3) */
    res.redirect(`/confessions/${user.id}`);
  } catch (error) {
    console.error("Failed to create session:", error);
    res.status(500).send('Internal server error');
  }
}

module.exports = { get, post };
