/**
 * CricBid Arena - AI Auctioneer Voice Commentary Engine
 * Uses the native Web Speech API (speechSynthesis) with zero external dependencies!
 */

class AuctioneerCommentaryEngine {
  private isEnabled: boolean = false;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    const saved = localStorage.getItem('cricbid_commentary_enabled');
    this.isEnabled = saved === 'true';

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.selectBestVoice();
      };
      this.selectBestVoice();
    }
  }

  private selectBestVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prefer clear English accents (UK/Indian/US) for auctioneer cadence
    const preferred = voices.find(v => 
      v.lang.includes('en-GB') || 
      v.lang.includes('en-IN') || 
      v.name.includes('David') || 
      v.name.includes('George') ||
      v.lang.includes('en-US')
    );
    this.voice = preferred || voices[0] || null;
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem('cricbid_commentary_enabled', String(this.isEnabled));
    if (this.isEnabled) {
      this.speak("Auctioneer commentary activated. Ready for bidding.");
    } else {
      this.cancel();
    }
    return this.isEnabled;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public speak(text: string) {
    if (!this.isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterance to avoid delay
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.rate = 1.08; // Energetic auction cadence
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback if browser speech policy blocks
    }
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Pre-configured auction commentary helpers
  public announcePlayerCalled(playerName: string, role: string, priceStr: string) {
    this.speak(`${playerName}, ${role}. Starting at ${priceStr}. Bidding is now open.`);
  }

  public announceBidPlaced(teamName: string, amountStr: string) {
    this.speak(`${amountStr}, ${teamName}.`);
  }

  public announceGoingOnce() {
    this.speak("Going once...");
  }

  public announceGoingTwice() {
    this.speak("Going twice...");
  }

  public announceFinalCall() {
    this.speak("Final call!");
  }

  public announceSold(playerName: string, teamName: string, amountStr: string) {
    this.speak(`Hammer down! Sold, to ${teamName} for ${amountStr}!`);
  }

  public announceUnsold(playerName: string) {
    this.speak(`${playerName} remains unsold.`);
  }
}

export const commentaryEngine = new AuctioneerCommentaryEngine();

