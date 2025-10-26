import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { postsAPI, Post } from '@/services/posts';
import { useAuthStore } from '@/store/authStore';

const Posts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [postType, setPostType] = useState<string>('all');
  const [isFundable, setIsFundable] = useState<string>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const params: any = {};
        
        if (searchQuery) {
          // Note: We'll filter client-side for now since API doesn't have search
        }
        
        if (postType !== 'all') {
          params.postType = postType;
        }
        
        if (isFundable !== 'all') {
          params.isFundable = isFundable === 'fundable';
        }

        const response = await postsAPI.getPosts(params);
        let fetchedPosts = response.posts;

        // Client-side search filtering
        if (searchQuery) {
          fetchedPosts = fetchedPosts.filter(
            (post) =>
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.content.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, postType, isFundable]);

  const handleLike = async (postId: number) => {
    try {
      await postsAPI.likePost(postId);
      // Refresh posts
      const response = await postsAPI.getPosts();
      setPosts(response.posts);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleShare = async (postId: number) => {
    try {
      await postsAPI.sharePost(postId);
      // Refresh posts
      const response = await postsAPI.getPosts();
      setPosts(response.posts);
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  const handleFund = (postId: number) => {
    // Navigate to funding page
    window.location.href = `/donate?post_id=${postId}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background to-card">
        {/* Header */}
        <section className="py-8 sm:py-12 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                Community <span className="text-primary">Posts</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Insights, achievements, trends, and announcements from the community.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 sm:py-8 bg-card/50 sticky top-0 z-10 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="insights">Insights</SelectItem>
                  <SelectItem value="achievements">Achievements</SelectItem>
                  <SelectItem value="trends">Trends</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                </SelectContent>
              </Select>
              <Select value={isFundable} onValueChange={setIsFundable}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Funding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="fundable">Fundable Only</SelectItem>
                  <SelectItem value="non-fundable">Non-Fundable</SelectItem>
                </SelectContent>
              </Select>
              {user && (
                <Button onClick={() => window.location.href = '/posts/create'}>
                  Create Post
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Posts Feed */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => { 
                      setSearchQuery(''); 
                      setPostType('all'); 
                      setIsFundable('all'); 
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onFund={() => handleFund(post.id)}
                    onLike={() => handleLike(post.id)}
                    onShare={() => handleShare(post.id)}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Posts;
