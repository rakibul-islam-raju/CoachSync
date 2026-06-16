import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";

export const createZodResolver = <T extends FieldValues>(
  schema: unknown,
): Resolver<T> => zodResolver(schema as never) as unknown as Resolver<T>;
