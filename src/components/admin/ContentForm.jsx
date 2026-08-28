import { useEffect, useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";

const ContentForm = ({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitting,
}) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [uploadError, setUploadError] =
    useState("");

  const fileInputRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | INITIAL VALUES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const defaults = {};

    fields.forEach((f) => {
      let v = initialValues?.[f.name];

      if (f.type === "array") {
        v = Array.isArray(v)
          ? v.join(", ")
          : v || "";
      }

      if (f.type === "checkbox") {
        v = !!v;
      }

      if (f.type === "date" && v) {
        v = String(v).slice(0, 10);
      }

      defaults[f.name] =
        v ??
        (f.type === "checkbox"
          ? false
          : "");
    });

    if (!defaults.status) {
      defaults.status = "draft";
    }

    setValues(defaults);
  }, [initialValues, fields]);

  /*
  |--------------------------------------------------------------------------
  | HANDLE FIELD CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGE UPLOAD
  |--------------------------------------------------------------------------
  */

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploadError("");

    /*
    |--------------------------------------------------------------------------
    | CLIENT-SIDE VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!file.type.startsWith("image/")) {
      setUploadError(
        "Please select an image file."
      );

      return;
    }

    // Backend limit is 5 MB.
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        "Image must be smaller than 5 MB."
      );

      return;
    }

    try {
      setUploadingImage(true);

      const token = localStorage.getItem(
        "amri_admin_token"
      );

      if (!token) {
        throw new Error(
          "Your admin session has expired. Please log in again."
        );
      }

      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch(
        "/api/upload/image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      /*
      |--------------------------------------------------------------------------
      | SAFELY HANDLE RESPONSE
      |--------------------------------------------------------------------------
      */

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let result = null;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        result = await response.json();
      } else {
        const text =
          await response.text();

        throw new Error(
          `Upload failed (${response.status}). ${
            text.slice(0, 100) || ""
          }`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Image upload failed."
        );
      }

      const imageUrl =
        result?.data?.url;

      if (!imageUrl) {
        throw new Error(
          "Image uploaded, but no image URL was returned."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SAVE CLOUDINARY URL IN FORM STATE
      |--------------------------------------------------------------------------
      */

      setValues((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    } catch (err) {
      console.error(
        "Image upload failed:",
        err
      );

      setUploadError(
        err.message ||
          "Image upload failed."
      );
    } finally {
      setUploadingImage(false);

      /*
      |--------------------------------------------------------------------------
      | RESET FILE INPUT
      |--------------------------------------------------------------------------
      */

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILE SELECT
  |--------------------------------------------------------------------------
  */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleImageUpload(file);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE IMAGE
  |--------------------------------------------------------------------------
  */

  const removeImage = () => {
    setValues((prev) => ({
      ...prev,
      image: "",
    }));

    setUploadError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATE
  |--------------------------------------------------------------------------
  */

  const validate = () => {
    const errs = {};

    fields.forEach((f) => {
      if (
        f.required &&
        !values[f.name]
      ) {
        errs[f.name] = "Required";
      }
    });

    setErrors(errs);

    return (
      Object.keys(errs).length === 0
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (uploadingImage) {
      return;
    }

    if (!validate()) {
      return;
    }

    const payload = {
      ...values,
    };

    fields.forEach((f) => {
      if (f.type === "array") {
        payload[f.name] = values[f.name]
          ? values[f.name]
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
      }
    });

    onSubmit(payload);
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid md:grid-cols-2 gap-5">
        {fields.map((f) => (
          <div
            key={f.name}
            className={
              f.wide
                ? "md:col-span-2"
                : ""
            }
          >
            {/* =====================================================
                LABEL
            ===================================================== */}

            <label className="block text-sm font-medium text-[#101c4d] mb-1.5">
              {f.label}

              {f.required && (
                <span className="text-[#f2a223]">
                  {" "}
                  *
                </span>
              )}
            </label>

            {/* =====================================================
                IMAGE UPLOAD
            ===================================================== */}

            {f.name === "image" && (
              <div className="space-y-3">
                {/* Hidden file input */}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />

                {/* IMAGE PREVIEW */}

                {values.image ? (
                  <div className="relative overflow-hidden rounded-lg border border-[#101c4d]/10 bg-gray-50">
                    <img
                      src={values.image}
                      alt="Preview"
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                    <button
                      type="button"
                      onClick={
                        removeImage
                      }
                      disabled={
                        uploadingImage ||
                        submitting
                      }
                      className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/95 text-red-600 shadow-sm hover:bg-white disabled:opacity-50"
                      aria-label="Remove image"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-[#101c4d]/20 rounded-lg bg-gray-50 px-5 py-8 text-center">
                    <ImagePlus
                      size={30}
                      className="mx-auto text-[#101c4d]/30 mb-3"
                    />

                    <p className="text-sm text-[#101c4d]/60">
                      No image selected
                    </p>

                    <p className="text-xs text-[#101c4d]/40 mt-1">
                      JPG, PNG, WEBP up to 5 MB
                    </p>
                  </div>
                )}

                {/* UPLOAD BUTTON */}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={
                      uploadingImage ||
                      submitting
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-[#101c4d]/15 text-sm font-medium text-[#101c4d] hover:bg-[#101c4d]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />

                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImagePlus
                          size={16}
                        />

                        {values.image
                          ? "Change Image"
                          : "Choose Image"}
                      </>
                    )}
                  </button>

                  {values.image &&
                    !uploadingImage && (
                      <button
                        type="button"
                        onClick={
                          removeImage
                        }
                        disabled={
                          submitting
                        }
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove image
                      </button>
                    )}
                </div>

                {/* UPLOAD ERROR */}

                {uploadError && (
                  <p className="text-xs text-red-600">
                    {uploadError}
                  </p>
                )}

                {/* CLOUDINARY URL — SMALL DEBUG/INFO */}

                {values.image && (
                  <p className="text-[11px] text-[#101c4d]/40 break-all">
                    Image uploaded successfully.
                  </p>
                )}

                {/* FIELD VALIDATION */}

                {errors[f.name] && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors[f.name]}
                  </p>
                )}
              </div>
            )}

            {/* =====================================================
                TEXTAREA
            ===================================================== */}

            {f.type === "textarea" && (
              <textarea
                rows={
                  f.name ===
                  "description"
                    ? 5
                    : 3
                }
                value={
                  values[f.name] || ""
                }
                onChange={(e) =>
                  handleChange(
                    f.name,
                    e.target.value
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2a223]"
              />
            )}

            {/* =====================================================
                SELECT
            ===================================================== */}

            {f.type === "select" && (
              <select
                value={
                  values[f.name] || ""
                }
                onChange={(e) =>
                  handleChange(
                    f.name,
                    e.target.value
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2a223]"
              >
                {f.options.map(
                  (opt) => (
                    <option
                      key={opt}
                      value={opt}
                    >
                      {opt}
                    </option>
                  )
                )}
              </select>
            )}

            {/* =====================================================
                CHECKBOX
            ===================================================== */}

            {f.type === "checkbox" && (
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!values[f.name]}
                  onChange={(e) =>
                    handleChange(
                      f.name,
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-[#f2a223] focus:ring-[#f2a223]"
                />

                <span className="text-sm text-[#101c4d]/70">
                  Mark as featured
                </span>
              </label>
            )}

            {/* =====================================================
                TEXT / DATE / URL
            ===================================================== */}

            {["text", "date", "url"].includes(
              f.type
            ) &&
              f.name !== "image" && (
                <input
                  type={
                    f.type === "url"
                      ? "text"
                      : f.type
                  }
                  value={
                    values[f.name] ||
                    ""
                  }
                  onChange={(e) =>
                    handleChange(
                      f.name,
                      e.target.value
                    )
                  }
                  placeholder={
                    f.placeholder
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2a223]"
                />
              )}

            {/* =====================================================
                ARRAY
            ===================================================== */}

            {f.type === "array" && (
              <input
                type="text"
                value={
                  values[f.name] || ""
                }
                onChange={(e) =>
                  handleChange(
                    f.name,
                    e.target.value
                  )
                }
                placeholder="Comma-separated, e.g. Dr. A, Dr. B"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2a223]"
              />
            )}

            {/* =====================================================
                NORMAL FIELD ERROR
            ===================================================== */}

            {errors[f.name] &&
              f.name !== "image" && (
                <p className="text-xs text-red-600 mt-1">
                  {errors[f.name]}
                </p>
              )}
          </div>
        ))}
      </div>

      {/* =========================================================
          FORM ACTIONS
      ========================================================= */}

      <div className="flex justify-end gap-3 pt-2 border-t border-[#101c4d]/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={
            submitting ||
            uploadingImage
          }
          className="px-4 py-2 text-sm font-medium text-[#101c4d]/70 hover:bg-[#101c4d]/5 rounded-md disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            submitting ||
            uploadingImage
          }
          className="px-5 py-2 text-sm font-medium text-white bg-[#101c4d] hover:bg-[#1a2a63] rounded-md disabled:opacity-60 inline-flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2
                size={15}
                className="animate-spin"
              />

              Saving…
            </>
          ) : uploadingImage ? (
            <>
              <Loader2
                size={15}
                className="animate-spin"
              />

              Uploading image…
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  );
};

export default ContentForm;