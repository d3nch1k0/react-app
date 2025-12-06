import { createClient, RealtimeChannel } from '@supabase/supabase-js'

const supabaseUrl = 'https://xyjjtcldwluxpanwbmte.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5amp0Y2xkd2x1eHBhbndibXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTEwNTUsImV4cCI6MjA4MDI2NzA1NX0.aNVI4Tw65QmeNxYdtN9bPTq3EUXe4czBR-VI6qpGR_w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface BlogPost {
  id: number
  title: string
  content: string
  created_at: string
  author_name: string
  likes_count: number
  tags: string[]
}

// Хранилище для каналов подписки
const channels = new Map<string, RealtimeChannel>()

export const blogApi = {
  async getPosts(tag?: string) {
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (tag) {
      query = query.contains('tags', [tag])
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error:', error)
      return []
    }
    
    return data as BlogPost[]
  },
  
  async createPost(title: string, content: string, tags: string[] = [], authorName?: string) {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        { 
          title, 
          content, 
          author_name: authorName || 'Гость',
          likes_count: 0,
          tags: tags
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error:', error)
      return null
    }
    
    return data as BlogPost
  },
  
  async likePost(postId: number, userId: string) {
    if (!userId) return null;

    const { data: existingLike} = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      return null;
    }
  
    const { error: insertError } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, user_id: userId }]);

    if (insertError) {
      console.error('Ошибка добавления лайка:', insertError);
      return null;
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('Ошибка получения поста:', postError);
      return null;
    }

    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update({ likes_count: (post.likes_count || 0) + 1 })
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      console.error('Ошибка обновления лайков:', updateError);
      return null;
    }

    return updatedPost as BlogPost;
  },

  // Подписка на обновления постов в реальном времени
  subscribeToPosts(
    callback: (payload: { eventType: string; new: BlogPost; old?: BlogPost }) => void,
    filter?: { tag?: string }
  ) {
    const channelKey = filter?.tag ? `posts-${filter.tag}` : 'posts-all'
    
    // Если уже есть подписка, отписываемся
    if (channels.has(channelKey)) {
      this.unsubscribeFromPosts(filter)
    }

    // Создаем канал для подписки
    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*', // Все события: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'posts',
          filter: filter?.tag ? `tags=cs.{${filter.tag}}` : undefined
        },
        (payload) => {
          callback(payload as any)
        }
      )
      .subscribe()

    channels.set(channelKey, channel)
    
    return () => this.unsubscribeFromPosts(filter)
  },

  // Отписка от обновлений
  unsubscribeFromPosts(filter?: { tag?: string }) {
    const channelKey = filter?.tag ? `posts-${filter.tag}` : 'posts-all'
    const channel = channels.get(channelKey)
    
    if (channel) {
      supabase.removeChannel(channel)
      channels.delete(channelKey)
    }
  },

  // Подписка на лайки
  subscribeToLikes(
    postId: number,
    callback: (payload: { eventType: string; new: any; old?: any }) => void
  ) {
    const channelKey = `likes-${postId}`
    
    if (channels.has(channelKey)) {
      this.unsubscribeFromLikes(postId)
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${postId}`
        },
        callback
      )
      .subscribe()

    channels.set(channelKey, channel)
    
    return () => this.unsubscribeFromLikes(postId)
  },

  unsubscribeFromLikes(postId: number) {
    const channelKey = `likes-${postId}`
    const channel = channels.get(channelKey)
    
    if (channel) {
      supabase.removeChannel(channel)
      channels.delete(channelKey)
    }
  }
}