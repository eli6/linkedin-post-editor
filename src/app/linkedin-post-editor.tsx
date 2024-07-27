"use client"

import React, { useState, useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Post {
  id: number;
  title: string;
  content: string;
  publishDate: string;
  isPublished: boolean;
}

interface Emoji {
  native: string;
}

const LinkedInPostEditor: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPost, setCurrentPost] = useState<Post>({ id: 0, title: '', content: '', publishDate: '', isPublished: false });
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [favoriteEmojis, setFavoriteEmojis] = useState<string[]>([]);
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedPosts = localStorage.getItem('linkedinPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
    const savedFavorites = localStorage.getItem('favoriteEmojis');
    if (savedFavorites) {
      setFavoriteEmojis(JSON.parse(savedFavorites));
    }
    const savedRecentEmojis = localStorage.getItem('recentEmojis');
    if (savedRecentEmojis) {
      setRecentEmojis(JSON.parse(savedRecentEmojis));
    }
  }, []);

  const savePosts = (newPosts: Post[]): void => {
    localStorage.setItem('linkedinPosts', JSON.stringify(newPosts));
    setPosts(newPosts);
  };

  const saveFavoriteEmojis = (newFavorites: string[]): void => {
    localStorage.setItem('favoriteEmojis', JSON.stringify(newFavorites));
    setFavoriteEmojis(newFavorites);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setCurrentPost({ ...currentPost, [name]: value });
    if (name === 'content') {
      const cursorPos = e.target.selectionStart;
      if (cursorPos !== null) {
        setCursorPosition(cursorPos);
      }
    }
  };

  const handlePublishToggle = (): void => {
    setCurrentPost({ ...currentPost, isPublished: !currentPost.isPublished });
  };

  const handleSavePost = (): void => {
    if (currentPost.id === 0) {
      const newPost: Post = { ...currentPost, id: Date.now() };
      savePosts([...posts, newPost]);
    } else {
      const updatedPosts = posts.map(post => 
        post.id === currentPost.id ? currentPost : post
      );
      savePosts(updatedPosts);
    }
    setCurrentPost({ id: 0, title: '', content: '', publishDate: '', isPublished: false });
  };

  const handleLoadPost = (post: Post): void => {
    setCurrentPost(post);
  };

  const handleDeletePost = (id: number): void => {
    const updatedPosts = posts.filter(post => post.id !== id);
    savePosts(updatedPosts);
    if (currentPost.id === id) {
      setCurrentPost({ id: 0, title: '', content: '', publishDate: '', isPublished: false });
    }
  };

  const updateRecentEmojis = (emoji: string) => {
    setRecentEmojis(prevEmojis => {
      const newEmojis = [emoji, ...prevEmojis.filter(e => e !== emoji)].slice(0, 10);
      localStorage.setItem('recentEmojis', JSON.stringify(newEmojis));
      return newEmojis;
    });
  };

  const addEmoji = (emoji: string): void => {
    const newContent = 
      currentPost.content.slice(0, cursorPosition) + 
      emoji + 
      currentPost.content.slice(cursorPosition);
    setCurrentPost({ ...currentPost, content: newContent });
    
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newPosition = cursorPosition + emoji.length;
      textareaRef.current.setSelectionRange(newPosition, newPosition);
      setCursorPosition(newPosition);
    }
  };

  const handleEmojiSelect = (emoji: Emoji): void => {
    addEmoji(emoji.native);
    updateRecentEmojis(emoji.native);
    setShowEmojiPicker(false);
  };

  const toggleFavoriteEmoji = (emoji: string): void => {
    const newFavorites = favoriteEmojis.includes(emoji)
      ? favoriteEmojis.filter(e => e !== emoji)
      : [...favoriteEmojis, emoji];
    saveFavoriteEmojis(newFavorites);
  };

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>): void => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const togglePostExpansion = (id: number): void => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const styles = {
    container: {
      width: '100%',
      minHeight: '100vh',
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'row' as const,
      backgroundColor: '#1e1e1e',
      color: '#e0e0e0',
    },
    timelineContainer: {
      width: '20%',
      minWidth: '200px',
      padding: '2rem 1rem',
      borderRight: '1px solid #3f3f3f',
    },
    mainContentContainer: {
      flex: 1,
      padding: '2rem',
    },
    editorContainer: {
      marginBottom: '2rem',
    },
    postsContainer: {
      marginTop: '2rem',
    },
    timeline: {
      position: 'relative' as const,
      borderLeft: '2px solid #3f3f3f',
      paddingLeft: '1rem',
    },
    timelineItem: {
      position: 'relative' as const,
      marginBottom: '1rem',
    },
    timelineDot: {
      width: '0.75rem',
      height: '0.75rem',
      borderRadius: '50%',
      backgroundColor: '#03dac6',
      position: 'absolute' as const,
      left: '-1.4rem',
      top: '0.3rem',
    },
    timelineContent: {
      backgroundColor: '#2c2c2c',
      padding: '0.5rem',
      borderRadius: '4px',
    },
    input: {
      width: '100%',
      marginBottom: '1rem',
      padding: '0.5rem',
      backgroundColor: '#2c2c2c',
      border: '1px solid #3f3f3f',
      color: '#e0e0e0',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    textarea: {
      width: '100%',
      marginBottom: '1rem',
      padding: '0.5rem',
      backgroundColor: '#2c2c2c',
      border: '1px solid #3f3f3f',
      color: '#e0e0e0',
      borderRadius: '4px',
      resize: 'vertical' as const,
      minHeight: '150px',
      fontSize: '1rem',
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: '#3700b3',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '0.5rem',
      fontSize: '1rem',
    },
    emojiButton: {
      fontSize: '1.25rem',
      margin: '0 0.3rem',
      padding: '0.3rem 0.6rem',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
    },
    post: {
      border: '1px solid #3f3f3f',
      padding: '1rem',
      marginBottom: '1rem',
      backgroundColor: '#2c2c2c',
      borderRadius: '4px',
    },
    postTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#03dac6',
      cursor: 'pointer',
      marginBottom: '0.5rem',
    },
    postDate: {
      fontSize: '0.9rem',
      color: '#a0a0a0',
      marginBottom: '0.5rem',
    },
    postContent: {
      whiteSpace: 'pre-wrap' as const,
      marginTop: '10px',
      fontSize: '1rem',
      lineHeight: '1.5',
    },
    switch: {
      position: 'relative' as const,
      display: 'inline-block',
      width: '60px',
      height: '34px',
      marginBottom: '10px',
    },
    slider: {
      position: 'absolute' as const,
      cursor: 'pointer',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: '#ccc',
      transition: '.4s',
      borderRadius: '34px',
    },
    sliderChecked: {
      backgroundColor: '#03dac6',
    },
    sliderBefore: {
      position: 'absolute' as const,
      content: '""',
      height: '26px',
      width: '26px',
      left: '4px',
      bottom: '4px',
      backgroundColor: 'white',
      transition: '.4s',
      borderRadius: '50%',
    },
    sliderCheckedBefore: {
      transform: 'translateX(26px)',
    },
    switchInput: {
      opacity: '0',
      width: '0',
      height: '0',
    },
  };

  const sortedPosts = posts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());




  return (
    <div style={styles.container}>
      <div style={styles.timelineContainer}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#a0a0a0' }}>Timeline</h2>
        <div>
          {sortedPosts.filter(post => post.isPublished).map((post) => (
            <div key={post.id} style={styles.timelineItem}>
              <div style={styles.timelineDot} />
              <div style={styles.timelineContent}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{post.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>{post.publishDate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.mainContentContainer}>
      <div style={styles.editorContainer}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#bb86fc' }}>LinkedIn Post Editor</h1>
      
        <div>
          <input
            type="text"
            name="title"
            value={currentPost.title}
            onChange={handleInputChange}
            placeholder="Post Title"
            style={styles.input}
          />
          <textarea
            ref={textareaRef}
            name="content"
            value={currentPost.content}
            onChange={handleInputChange}
            onClick={handleTextareaClick}
            placeholder="Write your post here..."
            style={styles.textarea}
          />
          <input
            type="date"
            name="publishDate"
            value={currentPost.publishDate}
            onChange={handleInputChange}
            style={styles.input}
          />
          <div style={{ marginBottom: '1rem' }}>
            {recentEmojis.map(emoji => (
              <button 
                key={emoji} 
                onClick={() => addEmoji(emoji)}
                style={styles.emojiButton}
              >
                {emoji}
              </button>
            ))}
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{...styles.button, marginLeft: '0.5rem'}}
            >
              {showEmojiPicker ? 'Close Emoji Picker' : 'Open Emoji Picker'}
            </button>
          </div>
          {showEmojiPicker && (
            <div style={{ marginBottom: '1rem' }}>
              <Picker 
                data={data} 
                onEmojiSelect={handleEmojiSelect}
                onClickOutside={() => setShowEmojiPicker(false)}
                theme="dark"
                emojiButtonSize={28}
                emojiSize={20}
              />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{
              ...styles.switch,
              position: 'relative',
              display: 'inline-block',
              width: '60px',
              height: '34px',
            }}>
              <input
                type="checkbox"
                checked={currentPost.isPublished}
                onChange={handlePublishToggle}
                style={{
                  ...styles.switchInput,
                  opacity: 0,
                  width: 0,
                  height: 0,
                }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: currentPost.isPublished ? '#bb86fc' : '#2c2c2c',
                borderRadius: '34px',
                border: '2px solid #bb86fc',
                transition: 'background-color 0.2s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '26px',
                  width: '26px',
                  left: currentPost.isPublished ? '30px' : '4px',
                  bottom: '2px',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  transition: 'left 0.2s',
                }}/>
              </span>
            </label>
            <span style={{ marginLeft: '10px', color: '#e0e0e0', fontSize: '16px' }}>
              {currentPost.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
          <button onClick={handleSavePost} style={styles.button}>Save Post</button>
        </div>
        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Posts</h2>
  <div>
    {sortedPosts.map((post) => (
      <div key={post.id} style={styles.post}>
        <h3 
          style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#03dac6',
            cursor: 'pointer',
            marginBottom: '0.5rem'
          }}
          onClick={() => togglePostExpansion(post.id)}
        >
          {post.isPublished ? '📢 ' : ''}{post.title}
        </h3>
        <p style={{
          fontSize: '0.9rem',
          color: '#a0a0a0',
          marginBottom: '0.5rem'
        }}>
          {post.publishDate}
        </p>
        {expandedPosts.has(post.id) && (
  <>
    <p style={{
      whiteSpace: 'pre-wrap',
      marginBottom: '1rem',
      fontSize: '1rem',  // Explicitly set font size
      lineHeight: '1.5',  // Improve readability with line height
      color: '#e0e0e0'  // Ensure good contrast
    }}>
      {post.content}
    </p>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        onClick={() => handleLoadPost(post)} 
        style={{
          ...styles.button,
          flex: 1
        }}
      >
        Edit Post
      </button>
      <button 
        onClick={() => handleDeletePost(post.id)} 
        style={{
          ...styles.button,
          backgroundColor: '#cf6679',
          flex: 1
        }}
      >
        Delete Post
      </button>
    </div>

          </>
        )}
      </div>
    ))}
   </div>
   </div>
  </div>
  </div>
  );

};
  


export default LinkedInPostEditor;