import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/client.js';
import { STAY_TYPES } from '../../utils/format.js';

const empty = {
  title: '',
  description: '',
  type: 'homestay',
  city: '',
  state: '',
  address: '',
  pricePerNight: '',
  maxGuests: 2,
  bedrooms: 1,
  amenities: '',
  imageUrl: '',
};

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) =>
      setForm({
        ...empty,
        ...data,
        amenities: data.amenities.join(', '),
        imageUrl: data.images[0] || '',
      })
    );
  }, [id, isEdit]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const blur = (key) => () => setTouched({ ...touched, [key]: true });

  const isValidUrl = (url) => {
    if (!url.trim()) return true;
    try {
      const u = new URL(url.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const errors = {};
  if (!form.title.trim() || form.title.trim().length < 10 || form.title.trim().length > 100) {
    errors.title = 'Title must be between 10 and 100 characters';
  }
  if (!form.description.trim() || form.description.trim().length < 30) {
    errors.description = 'Description must be at least 30 characters';
  }
  if (!form.pricePerNight || Number(form.pricePerNight) <= 0) {
    errors.pricePerNight = 'Price must be greater than 0';
  }
  if (form.imageUrl && !isValidUrl(form.imageUrl)) {
    errors.imageUrl = 'Image URL must be a valid URL (http or https)';
  }

  const hasErrors = Object.keys(errors).length > 0;

  // TODO: replace the image URL field with real image upload (Cloudinary / multer).
  const submit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, description: true, pricePerNight: true, imageUrl: true });
    if (hasErrors) return;

    setError('');
    const { title, description, type, city, state, address, imageUrl, amenities } = form;
    const payload = {
      title,
      description,
      type,
      city,
      state,
      address,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };
    if (imageUrl) payload.images = [imageUrl];
    try {
      if (isEdit) await api.put(`/listings/${id}`, payload);
      else await api.post('/listings', payload);
      navigate('/host');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form className="card form wide" onSubmit={submit}>
      <h1>{isEdit ? 'Edit listing' : 'Create a new listing'}</h1>
      <div>
        <input required placeholder="Title" value={form.title} onChange={set('title')} onBlur={blur('title')} />
        {(touched.title || form.title) && errors.title && <small className="error">{errors.title}</small>}
      </div>
      <div>
        <textarea required placeholder="Describe your place" value={form.description} onChange={set('description')} onBlur={blur('description')} />
        {(touched.description || form.description) && errors.description && <small className="error">{errors.description}</small>}
      </div>
      <div className="row">
        <select value={form.type} onChange={set('type')}>
          {STAY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="grow">
          <input required type="number" min="1" placeholder="Price per night (₹)" value={form.pricePerNight} onChange={set('pricePerNight')} onBlur={blur('pricePerNight')} />
          {(touched.pricePerNight || form.pricePerNight) && errors.pricePerNight && <small className="error">{errors.pricePerNight}</small>}
        </div>
      </div>
      <div className="row">
        <input required placeholder="City" value={form.city} onChange={set('city')} />
        <input required placeholder="State" value={form.state} onChange={set('state')} />
      </div>
      <input required placeholder="Address" value={form.address} onChange={set('address')} />
      <div className="row">
        <label className="grow">Max guests
          <input type="number" min="1" value={form.maxGuests} onChange={set('maxGuests')} />
        </label>
        <label className="grow">Bedrooms
          <input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} />
        </label>
      </div>
      <input placeholder="Amenities (comma separated: WiFi, AC, Parking)" value={form.amenities} onChange={set('amenities')} />
      <div>
        <input placeholder="Image URL (optional)" value={form.imageUrl} onChange={set('imageUrl')} onBlur={blur('imageUrl')} />
        {(touched.imageUrl || form.imageUrl) && errors.imageUrl && <small className="error">{errors.imageUrl}</small>}
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={hasErrors}>{isEdit ? 'Save changes' : 'Publish listing'}</button>
    </form>
  );
}
