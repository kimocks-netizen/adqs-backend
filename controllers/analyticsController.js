const stub = (name) => (req, res) => res.json({ status: 'success', message: `${name} — not yet implemented` });
exports.logPageView     = stub('analytics.logPageView');
exports.logArticleClick = stub('analytics.logArticleClick');
exports.logServiceView  = stub('analytics.logServiceView');
exports.getSummary      = stub('analytics.getSummary');
exports.getTopArticles  = stub('analytics.getTopArticles');
exports.getTopServices  = stub('analytics.getTopServices');
