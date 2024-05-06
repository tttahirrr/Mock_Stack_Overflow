export function formatPostedTime(postedDate) {
    const now = new Date();
    const posted = new Date(postedDate);
   
    // difference in milliseconds
    const diffMs = now - posted;
    // convert difference to seconds, minutes, hours, and days
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
   
    // check if posted within the last 24 hours
    if (diffDays < 1) {
      if (diffHours < 1) {
        if (diffMins < 1) {
          return `${diffSecs} second${diffSecs !== 1 ? 's' : ''} ago`;
        }
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
   
    // check if posted within current year
    if (now.getFullYear() === posted.getFullYear()) {
      return `${posted.toLocaleString('en-US', { month: 'short', day: 'numeric' })} at ${posted.getHours()}:${posted.getMinutes().toString().padStart(2, '0')}`;
    }
   
    // if posted in a previous year
    return `${posted.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${posted.getHours()}:${posted.getMinutes().toString().padStart(2, '0')}`;
  }
 