import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import './sidebar.css'

function Songs() {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('🔍 Songs component loading...');
    
    // Fetch all items
    axios.get('http://localhost:3000/items')
      .then(response => {
        console.log('✅ Fetched items:', response.data);
        console.log('📊 Number of songs:', response.data.length);
        setItems(response.data);
      })
      .catch(error => console.error('❌ Error fetching items:', error));

    // Fetch favorites
    axios.get('http://localhost:3000/favorites')
      .then(response => setWishlist(response.data))
      .catch(error => {
        console.error('Error fetching favorites:', error);
        setWishlist([]);
      });

    // Fetch playlist
    axios.get('http://localhost:3000/playlist')
      .then(response => setPlaylist(response.data))
      .catch(error => {
        console.error('Error fetching playlist:', error);
        setPlaylist([]);
      });
  }, []);

  // Add to wishlist function
  const addToWishlist = async (itemId) => {
    try {
      const selectedItem = items.find(item => item.id === itemId);
      if (selectedItem) {
        await axios.post('http://localhost:3000/favorites', {
          itemId: selectedItem.id,
          ...selectedItem
        });
        const response = await axios.get('http://localhost:3000/favorites');
        setWishlist(response.data);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  // Remove from wishlist function
  const removeFromWishlist = async (itemId) => {
    try {
      const selectedItem = wishlist.find((item) => item.itemId === itemId);
      if (selectedItem) {
        await axios.delete(`http://localhost:3000/favorites/${selectedItem.id}`);
        const response = await axios.get('http://localhost:3000/favorites');
        setWishlist(response.data);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  // Add to playlist function
  const addToPlaylist = async (itemId) => {
    try {
      const selectedItem = items.find(item => item.id === itemId);
      if (selectedItem) {
        await axios.post('http://localhost:3000/playlist', {
          itemId: selectedItem.id,
          ...selectedItem
        });
        const response = await axios.get('http://localhost:3000/playlist');
        setPlaylist(response.data);
      }
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  };

  // Remove from playlist function
  const removeFromPlaylist = async (itemId) => {
    try {
      const selectedItem = playlist.find((item) => item.itemId === itemId);
      if (selectedItem) {
        await axios.delete(`http://localhost:3000/playlist/${selectedItem.id}`);
        const response = await axios.get('http://localhost:3000/playlist');
        setPlaylist(response.data);
      }
    } catch (error) {
      console.error('Error removing from playlist:', error);
    }
  };

  // Check if item is in wishlist
  const isItemInWishlist = (itemId) => {
    return wishlist.some((item) => item.itemId === itemId);
  };

  // Check if item is in playlist
  const isItemInPlaylist = (itemId) => {
    return playlist.some((item) => item.itemId === itemId);
  };

  // Filter songs based on search term
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const lowerCaseQuery = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.singer.toLowerCase().includes(lowerCaseQuery) ||
      item.genre.toLowerCase().includes(lowerCaseQuery)
    );
  });

  console.log('🎵 Current items in state:', items);
  console.log('🔍 Filtered items:', filteredItems);

  return (
    <div style={{display:"flex", justifyContent:"flex-end"}}>
      <div className="songs-container" style={{width:"1300px"}}>
        <div className="container mx-auto p-3">
          <h2 className="text-3xl font-semibold mb-4 text-center">Songs List</h2>
          <p>Total songs: {items.length}</p> {/* Debug info */}
          
          <InputGroup className="mb-3">
            <InputGroup.Text id="search-icon">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search by singer, genre, or song name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </InputGroup>
          <br />

          {/* Show loading or no results message */}
          {items.length === 0 && (
            <div className="text-center">
              <p>Loading songs...</p>
            </div>
          )}

          {filteredItems.length === 0 && items.length > 0 && (
            <div className="text-center">
              <p>No songs found matching your search.</p>
            </div>
          )}

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {filteredItems.map((item, index) => (
              <div key={item.id} className="col">
                <div className="card h-100">
                  <img
                    src={item.imgUrl}
                    alt="Item Image"
                    className="card-img-top rounded-top"
                    style={{ height: '200px', width: '100%' }}
                    onError={(e) => {
                      e.target.src = '/default-album.jpg';
                    }}
                  />
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title">{item.title}</h5>
                      {isItemInWishlist(item.id) ? (
                        <Button
                          variant="light"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <FaHeart color="red" />
                        </Button>
                      ) : (
                        <Button
                          variant="light"
                          onClick={() => addToWishlist(item.id)}
                        >
                          <FaRegHeart color="black" />
                        </Button>
                      )}
                    </div>
                    <p className="card-text">Genre: {item.genre}</p>
                    <p className="card-text">Singer: {item.singer}</p>
                    <audio controls className="w-100" id={`audio-${item.id}`} >
                      <source src={item.songUrl} />
                    </audio>
                  </div>
                  <div className="card-footer d-flex justify-content-center">
                    {isItemInPlaylist(item.id) ? (
                      <Button
                        variant="outline-secondary"
                        onClick={() => removeFromPlaylist(item.id)}
                      >
                        Remove From Playlist
                      </Button>
                    ) : (
                      <Button
                        variant="outline-primary"
                        onClick={() => addToPlaylist(item.id)}
                      >
                        Add to Playlist
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Songs;
