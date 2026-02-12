// const express = require("express");
// const router = express.Router();

// const {
//   createUser,
//   getAllUsers,
//   updateUser,
//   deleteUser
// } = require("../controllers/userController");

// // CREATE
// router.post("/create", createUser);

// // READ
// router.get("/all", getAllUsers);

// // UPDATE
// router.put("/update", updateUser);

// // DELETE
// router.post("/delete", deleteUser);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  bulkUploadUsers,
  downloadUserTemplate
} = require("../controllers/userController");

router.post("/create", createUser);
router.get("/all", getAllUsers);
router.put("/update", updateUser);
router.post("/delete", deleteUser);
router.post("/bulk-upload", bulkUploadUsers);
router.get("/template", downloadUserTemplate);

module.exports = router;
