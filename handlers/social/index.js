/*
app.get('/auth/facebook', passport.authenticate('facebook'), (req, res) => {})
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/signin' }), (req, res) => {
  res.redirect('/dashboard')
})
app.get('/auth/twitter', passport.authenticate('twitter'), (req, res) => {})
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/signin' }), (req, res) => {
  res.redirect('/dashboard')
})
app.get('/auth/google', passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'
  ] }))
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signin' }), (req, res) => {
  res.redirect('/dashboard')
})
app.get('/socialSignout', (req, res) => {
  req.logout()
  res.redirect('/signed-out')
})
*/
