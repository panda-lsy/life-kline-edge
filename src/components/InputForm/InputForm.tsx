import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { BirthDataSchema } from '@/utils/validation';
import type { BirthDataInput } from '@/utils/validation';
import type { BirthData } from '@/types';
import { SubmitButton } from './SubmitButton';
import { useTheme } from '@/hooks/useTheme';
import { getFormColors } from '@/utils/themeColors';

interface InputFormProps {
  onSubmit: (data: BirthData) => void;
  isLoading?: boolean;
}

export function InputForm({ onSubmit, isLoading = false }: InputFormProps) {
  const { themeName } = useTheme();
  const formColors = useMemo(() => getFormColors(themeName), [themeName]);

  const [cityData, setCityData] = useState<{
    getProvinceNames: () => string[];
    getCitiesByProvince: (name: string) => string[];
    getCityByName: (name: string) => { latitude: number; longitude: number; timezone: string } | undefined;
  } | null>(null);

  const [selectedProvince, setSelectedProvince] = useState<string>('北京市');
  const [selectedCity, setSelectedCity] = useState<string>('北京市');

  useEffect(() => {
    import('@/utils/cityData').then((module) => {
      setCityData({
        getProvinceNames: module.getProvinceNames,
        getCitiesByProvince: module.getCitiesByProvince,
        getCityByName: module.getCityByName,
      });
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BirthDataInput>({
    resolver: zodResolver(BirthDataSchema),
    defaultValues: {
      gender: 'male',
      location: {
        country: '中国',
        province: '北京市',
        city: '北京市',
        latitude: 39.9042,
        longitude: 116.4074,
        timezone: 'Asia/Shanghai',
      },
    },
  });

  const provinceNames = useMemo(() => cityData?.getProvinceNames() ?? [], [cityData]);
  const cityNames = useMemo(() => cityData?.getCitiesByProvince(selectedProvince) ?? [], [cityData, selectedProvince]);

  const updateLocation = useCallback((province: string, city: string) => {
    const cityInfo = cityData?.getCityByName(city);
    if (cityInfo) {
      setValue('location', {
        country: '中国',
        province,
        city,
        latitude: cityInfo.latitude,
        longitude: cityInfo.longitude,
        timezone: cityInfo.timezone,
      });
    }
  }, [setValue, cityData]);

  const handleProvinceChange = useCallback((provinceName: string) => {
    setSelectedProvince(provinceName);
    const cities = cityData?.getCitiesByProvince(provinceName) ?? [];
    if (cities.length > 0) {
      const firstCity = cities[0];
      setSelectedCity(firstCity);
      updateLocation(provinceName, firstCity);
    }
  }, [cityData, updateLocation]);

  const handleCityChange = useCallback((cityName: string) => {
    setSelectedCity(cityName);
    updateLocation(selectedProvince, cityName);
  }, [selectedProvince, updateLocation]);

  useEffect(() => {
    updateLocation(selectedProvince, selectedCity);
  }, [selectedProvince, selectedCity, updateLocation]);

  // 表单提交
  const onFormSubmit = (data: BirthDataInput) => {
    const birthData: BirthData = {
      ...data,
      gender: data.gender as 'male' | 'female',
      submittedAt: new Date(),
    };
    onSubmit(birthData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* 姓名（可选） */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
            <User className="inline w-4 h-4 mr-1" />
            姓名（可选）
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="请输入您的姓名"
            className="input"
          />
          {errors.name && (
            <p className="mt-1 text-sm transition-colors duration-300" style={{ color: formColors.error }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* 性别选择 */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            <User className="inline w-4 h-4 mr-1" />
            性别
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                {...register('gender')}
                type="radio"
                value="male"
                className="w-4 h-4 text-primary focus:ring-primary transition-colors duration-300"
                style={{ borderColor: formColors.radioBorder }}
              />
              <span className="ml-2 text-text">男</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                {...register('gender')}
                type="radio"
                value="female"
                className="w-4 h-4 text-primary focus:ring-primary transition-colors duration-300"
                style={{ borderColor: formColors.radioBorder }}
              />
              <span className="ml-2 text-text">女</span>
            </label>
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm transition-colors duration-300" style={{ color: formColors.error }}>
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* 出生日期 */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-text mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            出生日期
          </label>
          <input
            {...register('birthDate')}
            type="date"
            min="1900-01-01"
            max="2100-12-31"
            className="input"
          />
          {errors.birthDate && (
            <p className="mt-1 text-sm transition-colors duration-300" style={{ color: formColors.error }}>
              {errors.birthDate.message}
            </p>
          )}
        </div>

        {/* 出生时间 */}
        <div>
          <label htmlFor="birthTime" className="block text-sm font-medium text-text mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            出生时间
          </label>
          <input
            {...register('birthTime')}
            type="time"
            className="input"
          />
          {errors.birthTime && (
            <p className="mt-1 text-sm transition-colors duration-300" style={{ color: formColors.error }}>
              {errors.birthTime.message}
            </p>
          )}
          <p className="mt-1 text-xs transition-colors duration-300" style={{ color: formColors.placeholder }}>
            * 出生时间将根据真太阳时进行校正
          </p>
        </div>

        {/* 出生地 */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            出生地
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="province" className="block text-xs mb-1" style={{ color: formColors.placeholder }}>
                省份/直辖市/自治区
              </label>
              <select
                id="province"
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="input"
              >
                {provinceNames.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-xs mb-1" style={{ color: formColors.placeholder }}>
                城市
              </label>
              <select
                id="city"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="input"
                disabled={cityNames.length === 0}
              >
                {cityNames.length === 0 ? (
                  <option value="">暂无数据</option>
                ) : (
                  cityNames.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <SubmitButton
          isLoading={isLoading}
          label="开始分析"
          loadingLabel="正在分析中..."
        />

        {/* 隐私声明 */}
        <p className="text-xs text-center transition-colors duration-300" style={{ color: formColors.placeholder }}>
          * 您的数据仅用于本次分析，不会被保存或分享
        </p>
      </form>
    </div>
  );
}
