import { Schema, model } from "mongoose";
import slugify from "slugify";
import { IOrganization, OrgamizationModel } from "./organization.interface";

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    tagline: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    logo: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

organizationSchema.pre<IOrganization>("save", function (next) {
  // Generate slug from the name
  const slug = slugify(this.name, { lower: true });

  // Assign the generated slug to the slug field
  this.slug = slug;

  next();
});

export const Organization = model<IOrganization, OrgamizationModel>(
  "Organization",
  organizationSchema
);
