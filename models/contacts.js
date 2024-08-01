const express = require("express");
const router = express.Router();
const Joi = require("joi");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../models/contacts");

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

const favoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const contacts = await listContacts({ owner: req.user._id });
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.id);
    if (!contact || contact.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newContact = await addContact({ ...req.body, owner: req.user._id });
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.id);

    if (!contact || contact.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Not found" });
    }

    await removeContact(req.params.id);

    res.status(200).json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedContact = await updateContact(req.params.id, req.body);
    if (
      !updatedContact ||
      updatedContact.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/favorite", authMiddleware, async (req, res, next) => {
  try {
    const { error } = favoriteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedContact = await updateContact(req.params.id, {
      favorite: req.body.favorite,
    });
    if (
      !updatedContact ||
      updatedContact.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
