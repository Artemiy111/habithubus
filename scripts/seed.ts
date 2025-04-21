import { seed } from '../lib/db/seed'

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Ошибка при заполнении базы данных:', error)
    process.exit(1)
  })
