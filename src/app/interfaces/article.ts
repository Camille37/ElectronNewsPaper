export interface Article {
    id: string;
    id_user: string;
    abstract: string;
    subtitle: string;
    update_date: string;
    category: string;
    title: string;
    thumbnail_image?: string;
    thumbnail_media_type?: string;
    image_data?: string;
    image_media_type?: string;
    body?: string;
    user_last_edit?: string;
  }
