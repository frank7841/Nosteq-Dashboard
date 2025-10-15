// Client-side read status management using localStorage
// No backend required - tracks which conversations have been opened/clicked

const READ_STATUS_KEY = 'whatsapp_dashboard_read_conversations';

interface ReadStatusData {
  [conversationId: string]: {
    lastReadAt: string;
    messageCount: number;
  };
}

class ReadStatusManager {
  private getReadStatus(): ReadStatusData {
    try {
      const stored = localStorage.getItem(READ_STATUS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading read status from localStorage:', error);
      return {};
    }
  }

  private saveReadStatus(data: ReadStatusData): void {
    try {
      localStorage.setItem(READ_STATUS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving read status to localStorage:', error);
    }
  }

  // Mark a conversation as read (when user clicks/opens it)
  markAsRead(conversationId: number, messageCount: number = 0): void {
    const readStatus = this.getReadStatus();
    readStatus[conversationId.toString()] = {
      lastReadAt: new Date().toISOString(),
      messageCount,
    };
    this.saveReadStatus(readStatus);
  }

  // Check if a conversation is unread (has new messages since last read)
  isUnread(conversationId: number, currentMessageCount: number = 0): boolean {
    const readStatus = this.getReadStatus();
    const conversationStatus = readStatus[conversationId.toString()];
    
    if (!conversationStatus) {
      // Never been read before
      return currentMessageCount > 0;
    }

    // Unread if current message count is higher than when last read
    return currentMessageCount > conversationStatus.messageCount;
  }

  // Get unread count for a specific conversation
  getUnreadCount(conversationId: number, currentMessageCount: number = 0): number {
    const readStatus = this.getReadStatus();
    const conversationStatus = readStatus[conversationId.toString()];
    
    if (!conversationStatus) {
      return currentMessageCount;
    }

    const unreadCount = currentMessageCount - conversationStatus.messageCount;
    return Math.max(0, unreadCount);
  }

  // Get total unread conversations count
  getTotalUnreadCount(conversations: Array<{ id: number; messageCount?: number }>): number {
    return conversations.filter(conv => 
      this.isUnread(conv.id, conv.messageCount || 0)
    ).length;
  }

  // Clear all read status (useful for testing or reset)
  clearAll(): void {
    try {
      localStorage.removeItem(READ_STATUS_KEY);
    } catch (error) {
      console.error('Error clearing read status:', error);
    }
  }

  // Update message count for a conversation (when new messages arrive)
  updateMessageCount(conversationId: number, newMessageCount: number): void {
    const readStatus = this.getReadStatus();
    const conversationStatus = readStatus[conversationId.toString()];
    
    if (conversationStatus) {
      // Only update message count, keep the lastReadAt timestamp
      conversationStatus.messageCount = Math.max(conversationStatus.messageCount, newMessageCount);
      this.saveReadStatus(readStatus);
    }
  }
}

// Export singleton instance
export const readStatusManager = new ReadStatusManager();

// Export utility functions for easy use
export const markConversationAsRead = (conversationId: number, messageCount?: number) => 
  readStatusManager.markAsRead(conversationId, messageCount);

export const isConversationUnread = (conversationId: number, messageCount?: number) => 
  readStatusManager.isUnread(conversationId, messageCount);

export const getUnreadCount = (conversationId: number, messageCount?: number) => 
  readStatusManager.getUnreadCount(conversationId, messageCount);

export const getTotalUnreadCount = (conversations: Array<{ id: number; messageCount?: number }>) => 
  readStatusManager.getTotalUnreadCount(conversations);
