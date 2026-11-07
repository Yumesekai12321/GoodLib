import express from 'express';
import path from 'node:path';
import { projectRoot } from './config/paths.js';
import { bookRoutes } from './routes/books.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', path.join(projectRoot, 'src/views'));
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; frame-ancestors 'none'; form-action 'self'; base-uri 'self'",
    );
    res.locals.flash = null;
    // Local development only; also reject explicit cross-origin form submissions.
    if (
      req.method === 'POST' &&
      req.headers.origin &&
      req.headers.origin !== `${req.protocol}://${req.get('host')}`
    )
      return res.status(403).render('errors/error', {
        pageTitle: 'Lỗi 403',
        status: 403,
        message: 'Yêu cầu không cùng nguồn.',
      });
    next();
  });
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.use(express.static(path.join(projectRoot, 'src/public')));
  app.get('/', (req, res) => res.redirect('/books'));
  app.use('/books', bookRoutes(db));
  app.use((req, res) =>
    res.status(404).render('errors/error', {
      pageTitle: 'Không tìm thấy',
      status: 404,
      message: 'Trang bạn tìm không tồn tại.',
    }),
  );
  app.use(errorHandler);
  return app;
}
