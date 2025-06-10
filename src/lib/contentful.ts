import { createClient } from 'contentful';

export const contentfulClient = createClient({
  space: 'dh73eq98vt4i',
  accessToken: 'QeSEoZhwP8McSxfUantkRmuhlYO35obejLApcBYcJlI',
});

export const previewClient = createClient({
  space: 'dh73eq98vt4i',
  accessToken: '7n-K6a9OKUaPXjurThdBrGxdB_4CTpXi0R1XS1NQ2Eo',
  host: 'preview.contentful.com',
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