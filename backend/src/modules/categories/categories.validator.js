'use strict';

const { z } = require('zod');

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50),
});

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(50),
});

module.exports = { CreateCategorySchema, UpdateCategorySchema };
