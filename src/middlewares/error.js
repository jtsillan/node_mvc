export const catchError = (err, req, res, next) => {
    const error = err.toString()
    res.render('error/error', { text: error })
}