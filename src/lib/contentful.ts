import { createClient } from "contentful";

export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

export interface BlogPost {
  title: string;
  blogContent: any; // Rich text content
  authorName: string;
  featuredImage?: {
    fields: {
      file: {
        url: string;
      };
      title?: string;
      description?: string;
    };
  };
  sys: {
    id: string;
    createdAt: string;
  };
}
