import { seed } from "@kbnet/seed";

seed()
  .then(() => {
    console.log("KBNet setup completed successfully.");
  })
  .catch((error) => {
    console.error("Error during KBNet setup:", error);
  });
