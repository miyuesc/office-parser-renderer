export interface CommonRendererOptions {
  /** 是否显示图表，默认为 true */
  showCharts?: boolean;
  /** 是否显示插入元素，默认为 true */
  showInsertedElements?: boolean;
  /** 是否显示图片内容，默认为 true */
  showImages?: boolean;
  /** 是否显示音频内容，默认为 true */
  showAudio?: boolean;
  /** 是否显示视频内容，默认为 true */
  showVideo?: boolean;
  /** 是否显示批注，默认为 true */
  showComments?: boolean;
}

export const defaultCommonRendererOptions: Required<CommonRendererOptions> = {
  showCharts: true,
  showInsertedElements: true,
  showImages: true,
  showAudio: true,
  showVideo: true,
  showComments: true
};
