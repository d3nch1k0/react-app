import { createClient } from '@supabase/supabase-js'

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
  
  async likePost(postId: number) {
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single()
    
    if (!post) return null
    
    const { data, error } = await supabase
      .from('posts')
      .update({ likes_count: (post.likes_count || 0) + 1 })
      .eq('id', postId)
      .select()
    
    if (error) {
      console.error('Error:', error)
      return null
    }
    
    return data[0] as BlogPost
  }
}
