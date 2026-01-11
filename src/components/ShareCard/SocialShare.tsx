/**
 * 社交分享组件
 * 提供一键分享到各大社交媒体平台的功能
 */

import { useState, useCallback } from 'react';
import { Share2, Link2, Check, Copy } from 'lucide-react';

/**
 * 支持的社交平台
 */
export type SocialPlatform = 'twitter' | 'xiaohongshu' | 'weibo' | 'wechat' | 'link';

/**
 * 社交分享组件属性
 */
export interface SocialShareProps {
  /** 分享数据 */
  shareData: ShareData;
  /** 分享成功回调 */
  onShareSuccess?: (platform: SocialPlatform) => void;
  /** 分享失败回调 */
  onShareError?: (platform: SocialPlatform, error: Error) => void;
  /** 是否显示复制链接按钮 */
  showCopyLink?: boolean;
  /** 自定义容器类名 */
  className?: string;
}

/**
 * 社交平台配置
 */
interface PlatformConfig {
  /** 平台名称 */
  name: string;
  /** 平台图标 */
  icon: React.ReactNode;
  /** 主题色 */
  color: string;
  /** 是否支持直接分享 */
  supportsDirectShare: boolean;
}

/**
 * 分享数据
 */
export interface ShareData {
  /** 标题 */
  title: string;
  /** 描述文本 */
  description: string;
  /** 分享图片 URL（如果有） */
  imageUrl?: string;
  /** 链接 URL */
  url?: string;
  /** 标签 */
  hashtags?: string[];
}

/**
 * 生成各平台分享链接
 */
function generateShareUrl(platform: SocialPlatform, data: ShareData): string {
  const { title, description, url, hashtags } = data;
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${title}\n${description}`);
  const encodedTags = hashtags ? encodeURIComponent(hashtags.join(',')) : '';

  switch (platform) {
    case 'twitter':
      // X.com (Twitter) 分享链接
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${encodedTags}`;

    case 'xiaohongshu':
      // 小红书：需要用户手动分享，复制内容
      return shareUrl;

    case 'weibo':
      // 新浪微博分享链接
      return `https://service.weibo.com/share/share.php?title=${encodedText}&url=${encodedUrl}&pic=${data.imageUrl || ''}`;

    case 'wechat':
      // 微信：需要显示二维码，返回原链接
      return shareUrl;

    case 'link':
      // 复制链接
      return shareUrl;

    default:
      return shareUrl;
  }
}

/**
 * 复制文本到剪贴板
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // 兼容性降级方案
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}

/**
 * 社交分享按钮
 */
function ShareButton({
  platform,
  config,
  shareData: _shareData, // 暂未使用，预留用于未来功能扩展
  onClick,
  disabled,
}: {
  platform: SocialPlatform;
  config: PlatformConfig;
  shareData: ShareData;
  onClick: (platform: SocialPlatform) => void;
  disabled?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick(platform);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        borderColor: config.color,
        backgroundColor: isHovered ? `${config.color}10` : 'transparent',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: config.color }}
      >
        {config.icon}
      </div>
      <div className="flex-1 text-left">
        <div className="font-semibold text-gray-900">{config.name}</div>
        <div className="text-xs text-gray-600">
          {config.supportsDirectShare ? '一键分享' : '复制内容'}
        </div>
      </div>
      <Share2 className={`w-5 h-5 transition-transform ${isHovered ? 'scale-110' : ''}`} style={{ color: config.color }} />
    </button>
  );
}

/**
 * 复制成功提示
 */
function CopySuccessToast({ show, onHide: _onHide }: { show: boolean; onHide: () => void }) {
  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg">
        <Check className="w-5 h-5" />
        <span className="font-medium">已复制到剪贴板！</span>
      </div>
    </div>
  );
}

/**
 * 社交分享主组件
 */
export function SocialShare({
  shareData,
  onShareSuccess,
  onShareError,
  showCopyLink = true,
  className = '',
}: SocialShareProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<SocialPlatform | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  /**
   * 平台配置
   */
  const platforms: Record<SocialPlatform, PlatformConfig> = {
    twitter: {
      name: 'X (Twitter)',
      icon: <span className="text-white text-lg font-bold">X</span>,
      color: '#000000',
      supportsDirectShare: true,
    },
    xiaohongshu: {
      name: '小红书',
      icon: <span className="text-white text-lg">📕</span>,
      color: '#FF2442',
      supportsDirectShare: false,
    },
    weibo: {
      name: '新浪微博',
      icon: <span className="text-white text-lg">🌫️</span>,
      color: '#E6162D',
      supportsDirectShare: true,
    },
    wechat: {
      name: '微信',
      icon: <span className="text-white text-lg">💬</span>,
      color: '#07C160',
      supportsDirectShare: false,
    },
    link: {
      name: '复制链接',
      icon: <Link2 className="w-5 h-5 text-white" />,
      color: '#6B7280',
      supportsDirectShare: false,
    },
  };

  /**
   * 生成分享文本（用于复制）
   */
  const generateShareText = useCallback((platform: SocialPlatform): string => {
    const { title, description, url, hashtags } = shareData;
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const tags = hashtags ? hashtags.map((tag) => `#${tag}`).join(' ') : '';

    switch (platform) {
      case 'xiaohongshu':
        // 小红书风格
        return `🔮 ${title}\n\n${description}\n\n🎯 ${tags}\n\n🔗 ${shareUrl}\n\n✨ 人生K线 · 探索生命轨迹`;

      case 'wechat':
        // 微信风格
        return `${title}\n\n${description}\n\n点击查看详情：${shareUrl}`;

      case 'link':
        // 仅链接
        return shareUrl;

      default:
        return `${title}\n${description}\n\n${shareUrl}`;
    }
  }, [shareData]);

  /**
   * 处理分享点击
   */
  const handleShare = useCallback(
    async (platform: SocialPlatform) => {
      if (isSharing) return;

      setIsSharing(true);

      try {
        const config = platforms[platform];
        const shareUrl = generateShareUrl(platform, shareData);

        if (config.supportsDirectShare && shareUrl) {
          // 直接打开分享链接
          window.open(shareUrl, '_blank', 'width=600,height=400');
          onShareSuccess?.(platform);
        } else {
          // 复制内容到剪贴板
          const textToCopy = generateShareText(platform);
          const success = await copyToClipboard(textToCopy);

          if (success) {
            setCopiedPlatform(platform);
            setTimeout(() => setCopiedPlatform(null), 2000);
            onShareSuccess?.(platform);
          } else {
            throw new Error('复制失败');
          }
        }
      } catch (error) {
        console.error('分享失败:', error);
        onShareError?.(platform, error as Error);
      } finally {
        setIsSharing(false);
      }
    },
    [isSharing, shareData, generateShareText, onShareSuccess, onShareError]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <CopySuccessToast show={!!copiedPlatform} onHide={() => setCopiedPlatform(null)} />

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">分享到社交平台</h3>
        <p className="text-sm text-gray-600">选择平台一键分享，或复制内容手动分享</p>
      </div>

      <div className="space-y-3">
        {showCopyLink && (
          <ShareButton
            platform="link"
            config={platforms.link}
            shareData={shareData}
            onClick={handleShare}
            disabled={isSharing}
          />
        )}

        <ShareButton
          platform="twitter"
          config={platforms.twitter}
          shareData={shareData}
          onClick={handleShare}
          disabled={isSharing}
        />

        <ShareButton
          platform="xiaohongshu"
          config={platforms.xiaohongshu}
          shareData={shareData}
          onClick={handleShare}
          disabled={isSharing}
        />

        <ShareButton
          platform="weibo"
          config={platforms.weibo}
          shareData={shareData}
          onClick={handleShare}
          disabled={isSharing}
        />

        <ShareButton
          platform="wechat"
          config={platforms.wechat}
          shareData={shareData}
          onClick={handleShare}
          disabled={isSharing}
        />
      </div>

      {/* 分享提示 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Copy className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <div className="font-semibold mb-1">分享提示</div>
            <ul className="space-y-1 text-blue-700">
              <li>• X.com 和新浪微博支持一键分享</li>
              <li>• 小红书和微信需要手动粘贴分享内容</li>
              <li>• 分享时可上传生成的分享卡片图片</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
