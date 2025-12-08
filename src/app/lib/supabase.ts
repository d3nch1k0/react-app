import { createClient, RealtimeChannel } from '@supabase/supabase-js'

const supabaseUrl = 'https://xyjjtcldwluxpanwbmte.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5amp0Y2xkd2x1eHBhbndibXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTEwNTUsImV4cCI6MjA4MDI2NzA1NX0.aNVI4Tw65QmeNxYdtN9bPTq3EUXe4czBR-VI6qpGR_w'

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
      console.error('Error loading posts:', error)
      return []
    }

    return data as BlogPost[]
  },


  async createPost(title: string, content: string, tags: string[], authorName: string) {
    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, content, tags, author_name: authorName, likes_count: 0 }])
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return null
    }

    return data as BlogPost
  },

async likePost(postId: number, userId: string) {
  if (!userId) return null;


  const { data: existingLike } = await supabase
    .from('post_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingLike) {

    await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
  } else {

    await supabase
      .from('post_likes')
      .insert([{ post_id: postId, user_id: userId }]);
  }

  const { count, error } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) {
    console.error('Ошибка подсчёта лайков:', error);
    return null;
  }

  const likes_count = count || 0;

  const { data: updatedPost, error: updateError } = await supabase
    .from('posts')
    .update({ likes_count })
    .eq('id', postId)
    .select()
    .single();

  if (updateError) {
    console.error('Ошибка обновления likes_count:', updateError);
    return null;
  }

  return updatedPost as BlogPost;
},

subscribeToPosts(callback: (payload: any) => void, tag?: string) {
  const key = tag ? `posts-${tag}` : 'posts-all'

  if (channels.has(key)) this.unsubscribeFromPosts(tag)

  const channel = supabase.channel(key)

  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'posts',
      filter: tag ? `tags=cs.{"${tag}"}` : undefined
    },
    callback
  )

  channel.subscribe()
  channels.set(key, channel)

  return () => this.unsubscribeFromPosts(tag)
},

  unsubscribeFromPosts(tag?: string) {
    const key = tag ? `posts-${tag}` : 'posts-all'
    const ch = channels.get(key)
    if (ch) supabase.removeChannel(ch)
    channels.delete(key)
  }
}

