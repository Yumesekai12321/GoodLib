import { Router } from 'express';
import { bookController } from '../controllers/bookController.js';
import { bookService } from '../services/bookService.js';

export function bookRoutes(db) {
  const router = Router();
  const controller = bookController(bookService(db));
  router.get('/', controller.index);
  router.get('/new', controller.new);
  router.post('/', controller.create);
  router.get('/:id/edit', controller.edit);
  router.post('/:id', controller.update);
  router.get('/:id/archive', controller.confirmArchive);
  router.post('/:id/archive', controller.archive);
  return router;
}
