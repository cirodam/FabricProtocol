import { Post, PostType, PostSide, PricingUnit } from "./Post.js";
import { FileStore } from "../storage/FileStore.js";

interface PostRecord {
  id: string;
  posterId: string;
  type: PostType;
  side: PostSide;
  category: string;
  title: string;
  description: string;
  price: number;
  createdAt: string;
  quantity?: number;
  pricingUnit?: PricingUnit;
}

export class PostLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(post: Post): void {
    const record: PostRecord = {
      id: post.id,
      posterId: post.posterId,
      type: post.type,
      side: post.side,
      category: post.category,
      title: post.title,
      description: post.description,
      price: post.price,
      createdAt: post.createdAt.toISOString(),
      quantity: post.quantity,
      pricingUnit: post.pricingUnit,
    };
    this.store.write(post.id, record);
  }

  delete(postId: string): void {
    this.store.delete(postId);
  }

  loadAll(): Post[] {
    return this.store.readAll<PostRecord>().map(r => {
      const post = new Post(r.posterId, r.type, r.side, r.category, r.title, r.description, r.price, {
        quantity: r.quantity,
        pricingUnit: r.pricingUnit,
      });
      const p = post as unknown as Record<string, unknown>;
      p["id"] = r.id;
      p["createdAt"] = new Date(r.createdAt);
      return post;
    });
  }
}
