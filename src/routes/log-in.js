const { getUserByEmail } = require('../model/user.js')
const { Layout } = require('../templates.js')
const  bcrypt  = require('bcryptjs')
const { createSession } = require('../model/session')

function get(req, res) {
	const title = 'Log in to your account'
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
        <button class="Button">Log in</button>
      </form>
    </div>
  `
	const body = Layout({ title, content })
	res.send(body)
}

async function post(req, res) {
	const { email, password } = req.body
	const user = await getUserByEmail(email)
	if (!email || !password || !user) {
		return res.status(400).send('<h1>Login failed</h1>')
	}

	/* [1] Compare submitted password to stored hash */
	const result = await bcrypt.compare(password, user.hash)

		/* [2] If no match redirect back to same page so user can retry */
		if (!result) {
      return res.status(400).send("<h1>Login failed</h1>")
		} else {

		/* [3] If match create a session with their user ID, */
			const sessionID = await createSession(user.id)

			/* set a cookie with the session ID, */
			res.cookie('sid', sessionID, {
				signed: true,
				httpOnly: true,
				maxAge: 6000,
				sameSite: 'lax',
			})
			/* redirect to the user's confession page (e.g. /confessions/3) */
			res.redirect(`/confessions/${user.id}`)
		}
	
}

module.exports = { get, post }
