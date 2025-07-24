import { Router } from "express"
import { createNewProduct, getAllProduct, getProductById } from "../controllers/product.controller.js"
import upload from "../middlewares/multer.middleware.js"
const router = Router()

//product create karne images ke sath
router.route("/create").post(upload.fields({name:productImage, maxCount: 2}), createNewProduct)

//it will handle query and simple get All product request
router.route("/").get(getAllProduct)

//product ko id se search karega
router.route("/:id").get(getProductById)













export  default router