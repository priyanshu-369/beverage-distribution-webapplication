import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createNewSupplier, getAllSupplier, getSupplierById, toggleSupplierArchive, updateSupplierDetail } from "../controllers/supplier.controller.js";
const router = Router()

router.route("/").get(verifyJWT(["admin", "staff"]), getAllSupplier)

router.route("/create").post(verifyJWT(["admin", "staff"]), createNewSupplier)

router.route("/update/:id").put(verifyJWT(["admin", "staff"]), updateSupplierDetail)

router.route("/toggle/archive/:id").patch(verifyJWT(["admin", "staff"]), toggleSupplierArchive)

router.route("/:id").get(verifyJWT(["admin", "staff"]), getSupplierById)

export default  router;