"use client";

import { useState, useEffect } from 'react';
import { blogApi, BlogPost } from '../lib/supabase';
import { userNameService } from '../lib/user-name-service';
import UserInfo from '@/app/components/UserInfo';
import Link from 'next/link';
import './blog.css';
import { authService } from '../lib/auth-service';
export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tagInput: ''
  });
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchTag, setSearchTag] = useState('');
  const [currentUserName, setCurrentUserName] = useState<string>('');

  useEffect(() => {
    loadPosts();
    loadUserName();
  }, []);

  const loadPosts = async (tag?: string) => {
    setLoading(true);
    try {
      const data = await blogApi.getPosts(tag);
      setPosts(data);
    } catch (error) {
      console.error('Ошибка:', error);
    }
    setLoading(false);
  };

  const loadUserName = async () => {
    const userName = await userNameService.getCurrentUserName();
    setCurrentUserName(userName);
  };

  const addTag = () => {
    const tag = newPost.tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewPost({...newPost, tagInput: ''});
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!newPost.title.trim() || !newPost.content.trim()) {
    alert('Заполните заголовок и содержание');
    return;
  }
  
  setSubmitting(true);
  try {
    // Получаем имя пользователя
    let authorName = currentUserName; // Из UserInfo
    
    // Если пользователь авторизован через authService
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.name) {
      authorName = currentUser.name;
    }
    
    const createdPost = await blogApi.createPost(
      newPost.title,
      newPost.content,
      tags,
      authorName
    );
    
    if (createdPost) {
      setPosts([createdPost, ...posts]);
      setNewPost({ title: '', content: '', tagInput: '' });
      setTags([]);
      alert('Пост создан!');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Не удалось создать пост');
  }
  setSubmitting(false);
};

  const handleTagSearch = (tag: string) => {
    setSearchTag(tag);
    loadPosts(tag);
  };

  const clearSearch = () => {
    setSearchTag('');
    loadPosts();
  };
 // ---- лайки ----
  const handleLike = async (postId: number) => {
    const user = authService.getCurrentUser()
    if (!user?.id) return

    const updated = await blogApi.likePost(postId, user.id)
    if (!updated) return

    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, likes_count: updated.likes_count } : p))
    )
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleNameChange = (newName: string) => {
    setCurrentUserName(newName);
  };

  return (
    <div className="blog-container">
      <header className="blog-header">
        <div className="div">
        <Link href="/dashboard" className="bottom">
        Личный кабинет
        </Link>
        <Link href="/" className="bottom">
        На главную
        </Link>
        </div>
        <div className="header-right">
            <UserInfo onNameChange={handleNameChange} />
          
        </div>
      </header>

      <div className="blog-main">
        <div className="form-section">
          <h2>Новый пост</h2>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по тегу..."
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              className="search-input"
            />
            <button 
              onClick={() => handleTagSearch(searchTag)}
              className="search-btn"
            >
              Найти
            </button>
            {searchTag && (
              <button onClick={clearSearch} className="clear-btn">
                ✕
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="post-form">
            <input
              type="text"
              placeholder="Заголовок"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              className="form-input"
              required
            />
            
            <textarea
              placeholder="Текст поста..."
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              className="form-textarea"
              rows={4}
              required
            />
            
            <div className="tags-input">
              <input
                type="text"
                placeholder="Добавить тег"
                value={newPost.tagInput}
                onChange={(e) => setNewPost({...newPost, tagInput: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="tag-input"
              />
              <button type="button" onClick={addTag} className="add-tag-btn">
                +
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="selected-tags">
                {tags.map(tag => (
                  <span key={tag} className="tag">
                    #{tag}
                    <button 
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <div className="submit-section">
              <span className="post-as">
                Публикуется как: <strong>{currentUserName}</strong>
              </span>
              <button type="submit" disabled={submitting} className="submit-btn">
                {submitting ? 'Публикация...' : 'Опубликовать'}
              </button>
            </div>
          </form>
        </div>

        <div className="posts-section">
          <h2>
            {searchTag ? `Посты с тегом: #${searchTag}` : 'Все посты'}
            <span className="count"> ({posts.length})</span>
          </h2>
          
          {loading ? (
            <p className="loading">Загрузка...</p>
          ) : posts.length === 0 ? (
            <p className="no-posts">
              {searchTag ? `Нет постов с тегом #${searchTag}` : 'Пока нет постов'}
            </p>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <h3>{post.title}</h3>
                    <button 
                      onClick={() => handleLike(post.id)}
                      className="like-btn"
                    >
                      ❤️ {post.likes_count || 0}
                    </button>
                  </div>
                  
                  <div className="post-meta">
                    <span>👤 {post.author_name || 'Гость'}</span>
                    <span>📅 {formatDate(post.created_at)}</span>
                  </div>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagSearch(tag)}
                          className="post-tag"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className="post-content">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}