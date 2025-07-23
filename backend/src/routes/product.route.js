import { Router } from "express"
const router = Router()


router.route("/").get(getProductList)











export  default router