import { Router } from "express"
import { createNewProduct, deleteProductById, getAllProduct, getProductById, updateProductDetail, updateProductImage } from "../controllers/product.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router()

//product create karne images ke sath
router.route("/create").post(verifyJWT(["admin", "staff"]),upload.fields({name: "productImage", maxCount: 2}), createNewProduct)

//ye route update karega sirf product details ko
router.route("/update/details/:id").put(verifyJWT(["admin", "staff"]), updateProductDetail)

//ye route specifically sirf product image update karega
router.route("/update/image/:id").patch(verifyJWT(["admin", "staff"]), upload.fields({name: "productImage", maxCount: 2}), updateProductImage)

//ye route poduct id se usko delete karega
router.route("/delete/:id").delete(verifyJWT(["admin", "staff"]), deleteProductById)

//it will handle query and simple get All product request
router.route("/").get(getAllProduct)

//product ko id se search karega
router.route("/:id").get(getProductById)













export  default router