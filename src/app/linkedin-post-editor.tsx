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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);


  useEffect(() => {
    const savedPosts = localStorage.getItem('linkedinPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
    const savedFavorites = localStorage.getItem('favoriteEmojis');
    if (savedFavorites) {
      setFavoriteEmojis(JSON.parse(savedFavorites));
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

// Add this function to update recent emojis
const updateRecentEmojis = (emoji: string) => {
  setRecentEmojis(prevEmojis => {
    const newEmojis = [emoji, ...prevEmojis.filter(e => e !== emoji)].slice(0, 10);
    localStorage.setItem('recentEmojis', JSON.stringify(newEmojis));
    return newEmojis;
  });
};

// Modify your useEffect to load recent emojis
useEffect(() => {
  // ... (existing code)
  const savedRecentEmojis = localStorage.getItem('recentEmojis');
  if (savedRecentEmojis) {
    setRecentEmojis(JSON.parse(savedRecentEmojis));
  }
}, []);


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

  // Modify your handleEmojiSelect function
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
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#1e1e1e',
      color: '#e0e0e0',
      display: 'flex',
    },
    timelineContainer: {
      width: '200px',
      marginRight: '20px',
    },
    timeline: {
      position: 'relative' as const,
      height: '100%',
      borderLeft: '2px solid #3f3f3f',
      paddingLeft: '20px',
    },
    timelineItem: {
      position: 'relative' as const,
      marginBottom: '20px',
    },
    timelineDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#03dac6',
      position: 'absolute' as const,
      left: '-27px',
      top: '5px',
    },
    timelineContent: {
      backgroundColor: '#2c2c2c',
      padding: '10px',
      borderRadius: '4px',
    },
    timelineTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#03dac6',
      marginBottom: '5px',
    },
    timelineDate: {
      fontSize: '12px',
      color: '#a0a0a0',
    },
    editorContainer: {
      flex: 1,
    },
    heading: {
      fontSize: '24px',
      marginBottom: '20px',
      color: '#bb86fc',
    },
    input: {
      width: '100%',
      marginBottom: '10px',
      padding: '8px',
      backgroundColor: '#2c2c2c',
      border: '1px solid #3f3f3f',
      color: '#e0e0e0',
      borderRadius: '4px',
    },
    textarea: {
      width: '100%',
      marginBottom: '10px',
      padding: '8px',
      backgroundColor: '#2c2c2c',
      border: '1px solid #3f3f3f',
      color: '#e0e0e0',
      borderRadius: '4px',
      whiteSpace: 'pre-wrap' as const,
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#3700b3',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '10px',
    },
    deleteButton: {
      padding: '8px 16px',
      backgroundColor: '#cf6679',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    emojiButton: {
      fontSize: '20px',
      margin: '0 5px',
      padding: '5px 10px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
    },
    timelineHeading: {
      fontSize: '20px',
      marginBottom: '10px',
      color: '#bb86fc',
    },
    post: {
      border: '1px solid #3f3f3f',
      padding: '15px',
      marginBottom: '15px',
      backgroundColor: '#2c2c2c',
      borderRadius: '4px',
    },
    postTitle: {
      fontWeight: 'bold',
      color: '#03dac6',
      cursor: 'pointer',
    },
    postDate: {
      fontSize: '14px',
      color: '#a0a0a0',
    },
    postContent: {
      whiteSpace: 'pre-wrap' as const,
      marginTop: '10px',
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
        <h2 style={styles.timelineHeading}>Timeline</h2>
        <div style={styles.timeline}>
          {sortedPosts.filter(post => post.isPublished).map((post) => (
            <div key={post.id} style={styles.timelineItem}>
              <div style={styles.timelineDot} />
              <div style={styles.timelineContent}>
                <div style={styles.timelineTitle}>{post.title}</div>
                <div style={styles.timelineDate}>{post.publishDate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.editorContainer}>
        <h1 style={styles.heading}>LinkedIn Post Editor</h1>
        
        <div style={{ marginBottom: '20px' }}>
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
            rows={10}
            style={styles.textarea}
          />
          <input
            type="date"
            name="publishDate"
            value={currentPost.publishDate}
            onChange={handleInputChange}
            style={styles.input}
          />
          <div style={{ marginBottom: '10px' }}>
            {favoriteEmojis.map(emoji => (
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
  style={{...styles.button, marginLeft: '10px'}}
>
  {showEmojiPicker ? 'Close Emoji Picker' : 'Open Emoji Picker'}
</button>
{recentEmojis.map(emoji => (
  <button 
    key={emoji} 
    onClick={() => addEmoji(emoji)}
    style={styles.emojiButton}
  >
    {emoji}
  </button>
))}
        
          </div>
          {showEmojiPicker && (
            <div style={{ marginBottom: '10px' }}>
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
  
        <h2 style={styles.timelineHeading}>Posts</h2>
        <div>
          {sortedPosts.map((post) => (
            <div key={post.id} style={styles.post}>
              <h3 
                style={styles.postTitle}
                onClick={() => togglePostExpansion(post.id)}
              >
                {post.isPublished ? '📢 ' : ''}{post.title}
              </h3>
              <p style={styles.postDate}>
                {post.publishDate}
              </p>
              {expandedPosts.has(post.id) && (
                <>
                  <p style={styles.postContent}>{post.content}</p>
                  <button onClick={() => handleLoadPost(post)} style={styles.button}>
                    Edit Post
                  </button>
                  <button onClick={() => handleDeletePost(post.id)} style={styles.deleteButton}>
                    Delete Post
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

};

export default LinkedInPostEditor;